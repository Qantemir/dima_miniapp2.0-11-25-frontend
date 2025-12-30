// API client для работы с Python бэкендом

import {
  API_BASE_URL,
  type CatalogResponse,
  type Cart,
  type Order,
  type Product,
  type Category,
  type CreateOrderRequest,
  type UpdateAddressRequest,
  type UpdateStatusRequest,
  type ProductPayload,
  type CategoryPayload,
  type BroadcastRequest,
  type BroadcastResponse,
  type StoreStatus,
  type UpdateStoreStatusRequest,
  type ApiError,
  type AdminCategoryDetail,
  type AdminOrdersResponse,
} from '@/types/api';
import { getRequestAuthHeaders } from '@/lib/telegram';
import { deduplicateRequest, createDedupKey } from './request-deduplication';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Метод оставлен для совместимости вызовов инвалидации (ручного кэша нет).
  private invalidateCatalogCaches() {
    return;
  }

  // Кэшируем base URL и регулярные выражения для оптимизации
  private cachedBaseUrl: string | null = null;
  private readonly httpRegex = /^https?:\/\//;
  private readonly appApiRegex = /\/app\/api/;

  // Публичные эндпоинты, для которых не нужен X-Dev-User-Id
  private readonly publicEndpoints = ['/catalog', '/store/status'];

  private buildHeaders(existing?: HeadersInit, endpoint?: string): Headers {
    const headers = new Headers(existing);
    
    // Не отправляем X-Dev-User-Id для публичных эндпоинтов
    const isPublicEndpoint = endpoint && this.publicEndpoints.some(ep => endpoint.startsWith(ep));
    if (!isPublicEndpoint) {
      const authHeaders = getRequestAuthHeaders();
      // Оптимизированная обработка - напрямую проверяем ключи
      if (authHeaders['X-Dev-User-Id']) {
        headers.set('X-Dev-User-Id', authHeaders['X-Dev-User-Id']);
      }
    }
    return headers;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    // Оптимизированное формирование URL с кэшированием base
    if (!this.cachedBaseUrl) {
      if (this.httpRegex.test(this.baseUrl)) {
        this.cachedBaseUrl = this.baseUrl.replace(this.appApiRegex, '/api');
      } else {
        this.cachedBaseUrl = this.baseUrl;
      }
    }
    const url = `${this.cachedBaseUrl}${endpoint}`;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const controller = new AbortController();

    try {
      // Оптимизированные таймауты
      const isLargeRequest = endpoint.includes('/catalog') || endpoint.includes('/admin/orders');
      const isBroadcastRequest = endpoint.includes('/admin/broadcast');
      const isDeleteRequest = options?.method === 'DELETE';
      // DELETE запросы обычно быстрые, используем меньший таймаут
      // Большие запросы (каталог, заказы) требуют больше времени
      // Рассылка может занимать много времени в зависимости от количества клиентов
      const timeout = isBroadcastRequest ? 120_000 : isLargeRequest ? 8_000 : isDeleteRequest ? 3_000 : 5_000;
      timeoutId = setTimeout(() => controller.abort(), timeout);

      // Оптимизированная обработка заголовков
      const isFormData = typeof FormData !== 'undefined' && options?.body instanceof FormData;
      const headers = this.buildHeaders(options?.headers as HeadersInit, endpoint);
      
      // Добавляем ETag для каталога (если есть в localStorage)
      if (endpoint === '/catalog' && typeof window !== 'undefined') {
        const cachedEtag = localStorage.getItem('catalog-etag');
        if (cachedEtag) {
          headers.set('If-None-Match', cachedEtag);
        }
      }
      
      // Устанавливаем Content-Type только для JSON (FormData обрабатывается браузером)
      if (!isFormData && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      } else if (isFormData) {
        headers.delete('Content-Type'); // Браузер установит с boundary
      }

      const response = await fetch(url, {
        ...(options || {}),
        signal: controller.signal,
        headers,
      });

      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      if (response.status === 204) {
        return undefined as T;
      }

      // Обработка 304 Not Modified для каталога с ETag
      if (response.status === 304 && endpoint === '/catalog') {
        // 304 означает что данные не изменились
        // React Query будет использовать кэшированные данные
        // Бросаем специальную ошибку, которую обработаем в getCatalog
        throw new Error('NOT_MODIFIED');
      }

      // Сохраняем ETag для каталога
      if (endpoint === '/catalog' && typeof window !== 'undefined') {
        const etag = response.headers.get('ETag');
        if (etag) {
          localStorage.setItem('catalog-etag', etag);
        }
      }

      // Оптимизированная проверка Content-Type
      const contentType = response.headers.get('content-type');
      const isJson = contentType?.includes('application/json') ?? false;

      // Оптимизированная обработка ответа
      const payload: unknown = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
        if (isJson && payload) {
          const error = payload as Partial<ApiError> & { detail?: string; message?: string };
          errorMessage = error.detail || error.message || error.error || JSON.stringify(payload) || errorMessage;
        } else if (typeof payload === 'string') {
          errorMessage = payload;
        }

        if (response.status === 401) {
          // Упрощенная обработка 401 - быстрее
          const lowerMessage = errorMessage.toLowerCase();
          if (lowerMessage.includes('telegram') || lowerMessage.includes('устарел') || 
              lowerMessage.includes('неверные данные') || lowerMessage.includes('недействительная подпись')) {
            throw new Error('Неверные данные Telegram. Обновите страницу.');
          }
          throw new Error(errorMessage || 'Ошибка аутентификации. Обновите страницу.');
        }

        throw new Error(errorMessage);
      }

      if (!isJson) {
        throw new Error(
          'API вернул некорректный ответ (не JSON). Убедитесь, что переменная VITE_API_URL указывает на API.'
        );
      }

      return payload as T;
    } catch (error) {
      // Оптимизированная обработка таймаута
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (error instanceof Error && error.name === 'AbortError') {
        // React Query обрабатывает AbortError корректно (не показывает ошибку пользователю)
        // Бросаем ошибку только для таймаутов, чтобы пользователь знал о проблеме
        // Для отмененных запросов React Query просто отменяет query без показа ошибки
        throw new Error('Превышено время ожидания ответа от сервера.');
      }

      // Оптимизированная обработка сетевых ошибок
      if (error instanceof TypeError) {
        const msg = error.message.toLowerCase();
        if (msg.includes('fetch') || msg.includes('failed to fetch') || msg.includes('networkerror')) {
          throw new Error(`Не удалось подключиться к серверу. Проверьте, что бэкенд запущен и доступен.`);
        }
      }

      // Обработка 304 Not Modified - пробрасываем дальше для обработки в getCatalog
      if (error instanceof Error && error.message === 'NOT_MODIFIED') {
        throw error; // Пробрасываем для обработки в getCatalog
      }

      // Пробрасываем ошибку дальше
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  // CLIENT API

  async getCatalog(): Promise<CatalogResponse> {
    // Оптимизация: используем строку напрямую вместо createDedupKey для простых случаев
    // ETag поддержка добавлена в request() методе
    // Обработка 304 Not Modified выполняется в request() методе
    return deduplicateRequest('catalog', () => this.request<CatalogResponse>('/catalog'));
  }

  async getCart(): Promise<Cart> {
    // Оптимизация: используем строку напрямую
    return deduplicateRequest('cart', () => this.request<Cart>('/cart'));
  }

  async addToCart(data: {
    product_id: string;
    variant_id: string;
    quantity: number;
  }): Promise<Cart> {
    // variant_id теперь обязателен в схеме бэкенда
    const payload = {
      product_id: data.product_id,
      variant_id: data.variant_id,
      quantity: data.quantity,
    };
    return this.request<Cart>('/cart', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateCartItem(data: {
    item_id: string;
    quantity: number;
  }): Promise<Cart> {
    return this.request<Cart>('/cart/item', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async removeFromCart(data: {
    item_id: string;
  }): Promise<Cart> {
    return this.request<Cart>('/cart/item', {
      method: 'DELETE',
      body: JSON.stringify(data),
    });
  }

  async createOrder(data: CreateOrderRequest): Promise<Order> {
    // Оптимизированное создание FormData
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('phone', data.phone);
    formData.append('address', data.address);
    // Условные поля добавляем только если они есть
    if (data.comment) formData.append('comment', data.comment);
    if (data.delivery_type) formData.append('delivery_type', data.delivery_type);
    if (data.payment_type) formData.append('payment_type', data.payment_type);
    formData.append('payment_receipt', data.payment_receipt);

    return this.request<Order>('/order', {
      method: 'POST',
      body: formData,
    });
  }

  // Методы для просмотра заказов пользователем удалены

  // ADMIN API

  async getOrders(params?: {
    status?: string;
    limit?: number;
    cursor?: string;
    includeDeleted?: boolean;
  }): Promise<AdminOrdersResponse> {
    // Оптимизированное формирование query string
    const parts: string[] = [];
    if (params?.status) parts.push(`status=${encodeURIComponent(params.status)}`);
    if (params?.limit) parts.push(`limit=${params.limit}`);
    if (params?.cursor) parts.push(`cursor=${encodeURIComponent(params.cursor)}`);
    if (params?.includeDeleted) parts.push('include_deleted=true');
    
    const query = parts.length > 0 ? `?${parts.join('&')}` : '';
    return this.request<AdminOrdersResponse>(`/admin/orders${query}`);
  }

  async getAdminOrder(orderId: string): Promise<Order> {
    return this.request<Order>(`/admin/order/${orderId}`);
  }

  async updateOrderStatus(
    orderId: string,
    data: UpdateStatusRequest
  ): Promise<Order> {
    return this.request<Order>(`/admin/order/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteOrder(orderId: string): Promise<void> {
    return this.request(`/admin/order/${orderId}`, {
      method: 'DELETE',
    });
  }

  async getAdminCatalog(): Promise<CatalogResponse> {
    return this.request<CatalogResponse>('/admin/catalog');
  }

  async getAdminCategory(categoryId: string): Promise<AdminCategoryDetail> {
    return this.request<AdminCategoryDetail>(`/admin/category/${categoryId}`);
  }

  async createProduct(data: ProductPayload): Promise<Product> {
    const result = await this.request<Product>('/admin/product', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.invalidateCatalogCaches();
    return result;
  }

  async updateProduct(
    productId: string,
    data: Partial<ProductPayload>
  ): Promise<Product> {
    const result = await this.request<Product>(`/admin/product/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    this.invalidateCatalogCaches();
    return result;
  }

  async deleteProduct(productId: string): Promise<void> {
    await this.request(`/admin/product/${productId}`, {
      method: 'DELETE',
    });
    this.invalidateCatalogCaches();
  }

  async createCategory(data: CategoryPayload): Promise<Category> {
    const result = await this.request<Category>('/admin/category', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.invalidateCatalogCaches();
    return result;
  }

  async updateCategory(
    categoryId: string,
    data: Partial<CategoryPayload>
  ): Promise<Category> {
    const result = await this.request<Category>(`/admin/category/${categoryId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    this.invalidateCatalogCaches();
    return result;
  }

  async deleteCategory(categoryId: string) {
    await this.request(`/admin/category/${categoryId}`, {
      method: 'DELETE',
    });
    this.invalidateCatalogCaches();
  }

  async sendBroadcast(data: BroadcastRequest): Promise<BroadcastResponse> {
    return this.request<BroadcastResponse>('/admin/broadcast', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getStoreStatus(): Promise<StoreStatus> {
    // Используем дедупликацию запросов, чтобы избежать дублирующих запросов
    // и предотвратить 499 ошибки (client closed request)
    return deduplicateRequest('store-status', () => this.request<StoreStatus>('/store/status'));
  }

  async setStoreSleepMode(
    data: UpdateStoreStatusRequest
  ): Promise<StoreStatus> {
    return this.request<StoreStatus>('/admin/store/sleep', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }


  // setPaymentLink удален, т.к. payment_link больше не используется
}

export const api = new ApiClient(API_BASE_URL);

/**
 * Получает URL изображения продукта.
 * Поддерживает как file_id (ObjectId) для GridFS, так и base64/data URL для обратной совместимости.
 */
export function getProductImageUrl(image: string | undefined | null): string | undefined {
  if (!image || typeof image !== 'string') return undefined;
  
  try {
    // Если это data URL (base64), возвращаем как есть (для обратной совместимости)
    if (image.startsWith('data:image')) {
      return image;
    }
    
    // Если это уже полный URL, возвращаем как есть
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    
    // Если это валидный ObjectId (24 символа hex), это file_id из GridFS
    // ObjectId состоит из 24 hex символов
    if (/^[0-9a-fA-F]{24}$/.test(image)) {
      // Формируем URL для получения изображения из GridFS
      // Используем тот же подход, что и в ApiClient
      let baseUrl = API_BASE_URL;
      if (baseUrl.includes('/app/api')) {
        baseUrl = baseUrl.replace('/app/api', '/api');
      }
      // Убираем trailing slash если есть
      if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
      }
      return `${baseUrl}/product/image/${image}`;
    }
    
    // По умолчанию считаем, что это file_id (для обратной совместимости)
    let baseUrl = API_BASE_URL;
    if (baseUrl.includes('/app/api')) {
      baseUrl = baseUrl.replace('/app/api', '/api');
    }
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }
    return `${baseUrl}/product/image/${image}`;
  } catch (error) {
    // В случае любой ошибки возвращаем undefined
    console.warn('Error processing product image URL:', error);
    return undefined;
  }
}


