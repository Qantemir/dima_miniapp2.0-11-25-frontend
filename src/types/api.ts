// API Types для интеграции с Python бэкендом

export interface Category {
  id: string;
  name: string;
}

export interface CategoryPayload {
  name: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  description?: string;
  image?: string;
  available: boolean;
  quantity: number; // Количество на складе
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  image?: string;
  images?: string[];
  variants?: ProductVariant[];
  price?: number;
  available: boolean;
}

export interface ProductPayload {
  name: string;
  description?: string;
  price: number;
  image?: string;
  images?: string[];
  category_id: string;
  available: boolean;
  variants?: ProductVariant[];
}

export interface CatalogResponse {
  categories: Category[];
  products: Product[];
}

export interface CartItem {
  id: string;
  product_id: string;
  variant_id?: string;
  product_name: string;
  variant_name?: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface Cart {
  user_id: number;
  items: CartItem[];
  total_amount: number;
}

export interface OrderItem {
  product_id: string;
  variant_id?: string;
  product_name: string;
  variant_name?: string;
  quantity: number;
  price: number;
}

export type OrderStatus = 
  | 'принят' 
  | 'отказано';

export interface Order {
  id: string;
  user_id: number;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  comment?: string;
  delivery_type?: string;
  payment_type?: string;
  status: OrderStatus;
  rejection_reason?: string; // Причина отказа (если статус "отказано")
  items: OrderItem[];
  total_amount: number;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
  can_edit_address: boolean;
  payment_receipt_file_id?: string;
  payment_receipt_url?: string;
  payment_receipt_filename?: string;
}

export type BroadcastSegment = 'all' ;

export interface BroadcastRequest {
  title: string;
  message: string;
  segment: BroadcastSegment;
  link?: string;
}

export interface BroadcastResponse {
  success: boolean;
  sent_count: number;
  total_count: number;
  failed_count: number;
}

export interface AdminCategoryDetail {
  category: Category;
  products: Product[];
}

export interface AdminOrdersResponse {
  orders: Order[];
  next_cursor?: string | null;
}

export interface StoreStatus {
  is_sleep_mode: boolean;
  sleep_message?: string;
  // sleep_until и payment_link убраны, т.к. не используются
}

export interface UpdateStoreStatusRequest {
  sleep: boolean;
  message?: string;
  // sleep_until убран, т.к. не используется
}

// UpdatePaymentLinkRequest удален, т.к. payment_link больше не используется

export interface CreateOrderRequest {
  name: string;
  phone: string;
  address: string;
  comment?: string;
  delivery_type?: string;
  payment_type?: string;
  payment_receipt: File;
}

export interface UpdateAddressRequest {
  address: string;
}

export interface UpdateStatusRequest {
  status: OrderStatus;
  rejection_reason?: string; // Причина отказа (обязательна для статуса "отказано")
}

export interface ApiError {
  error: string;
  message: string;
  status_code: number;
  detail?: string;
}

// API Client Configuration
// Нормализуем API URL так, чтобы:
// - абсолютные http/https адреса использовались как есть;
// - пути, начинающиеся с '/', оставались относительными (для прокси и одинакового origin);
// - голые домены/поддомены получали https://;
// - путь всегда заканчивался на /api.

// Утилита для получения env переменных (используется только для ADMIN_IDS)
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  const nextPublicKey = `NEXT_PUBLIC_${key}`;
  
  // В Next.js переменные NEXT_PUBLIC_* доступны через process.env на клиенте
  // Они инжектируются во время сборки через next.config.js -> env
  let value = process.env[nextPublicKey] || process.env[key];
  
  // Fallback для SSR и других случаев
  if (!value && typeof window !== 'undefined') {
    // Пытаемся получить из __NEXT_DATA__ (встроенные Next.js env)
    const nextData = (window as any).__NEXT_DATA__;
    if (nextData?.env?.[nextPublicKey]) {
      value = nextData.env[nextPublicKey];
    }
  }
  
  const result = value ? String(value).trim() : defaultValue;
  
  // Отладочная информация (только в development)
  if (process.env.NODE_ENV === 'development' && key === 'VITE_ADMIN_IDS') {
    console.log('[ENV Debug]', {
      key,
      nextPublicKey,
      'process.env[NEXT_PUBLIC_VITE_ADMIN_IDS]': process.env[nextPublicKey],
      'process.env[VITE_ADMIN_IDS]': process.env[key],
      result,
      isEmpty: !result || result === '',
    });
  }
  
  return result;
};

// Чтение API URL с приоритетом: NEXT_PUBLIC_API_URL > NEXT_PUBLIC_VITE_API_URL > VITE_API_URL > '/api'
// В Next.js переменные NEXT_PUBLIC_* доступны через process.env на клиенте
const rawApiUrl = (
  process.env.NEXT_PUBLIC_API_URL || 
  process.env.NEXT_PUBLIC_VITE_API_URL || 
  process.env.VITE_API_URL || 
  '/api'
).replace(/^["']|["']$/g, '').trim();

const normalizeApiBaseUrl = (value: string) => {
  if (!value) return '/api';
  // Абсолютный URL
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value.replace(/\/$/, '');
  }
  // Относительный путь (оставляем для прокси и same-origin)
  if (value.startsWith('/')) {
    return value;
  }
  // Голый домен — добавляем https://
  return `https://${value.replace(/^\/+/, '')}`;
};

let apiBaseUrl = normalizeApiBaseUrl(rawApiUrl)
  // Убираем возможный /app из пути (если фронтенд развернут в подпапке)
  .replace(/\/app\/api/g, '/api')
  .replace(/\/app$/g, '');

if (!apiBaseUrl.endsWith('/api')) {
  apiBaseUrl = apiBaseUrl.replace(/\/$/, '') + '/api';
}

// ВАЖНО: Если используется относительный путь '/api', но мы в production на Railway,
// это означает, что переменная окружения не установлена!
if (apiBaseUrl === '/api' && typeof window !== 'undefined') {
  const isProduction = window.location.hostname.includes('railway.app') || 
                       window.location.hostname.includes('vercel.app') ||
                       process.env.NODE_ENV === 'production';
  if (isProduction) {
    console.error('[API Config] ❌ КРИТИЧЕСКАЯ ОШИБКА: Используется относительный путь /api в production!');
    console.error('[API Config] ❌ Установите переменную окружения в Railway!');
    console.error('[API Config] ❌ Поддерживаемые переменные:');
    console.error('[API Config]    - NEXT_PUBLIC_API_URL (рекомендуется)');
    console.error('[API Config]    - NEXT_PUBLIC_VITE_API_URL (для совместимости)');
    console.error('[API Config] ❌ Пример: NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app/api');
    console.error('[API Config] ❌ Или: NEXT_PUBLIC_VITE_API_URL=https://your-backend.up.railway.app/api');
  }
}

export const API_BASE_URL = apiBaseUrl;

// Admin user IDs (должен совпадать с config.py в Python боте)
const adminIdsString = getEnvVar('VITE_ADMIN_IDS', '');
export const ADMIN_IDS = adminIdsString
  .split(',')
  .map(id => parseInt(id.trim()))
  .filter(id => !isNaN(id));

// Предупреждение, если ADMIN_IDS пуст (в development и production)
if (typeof window !== 'undefined') {
  if (ADMIN_IDS.length === 0) {
    const isProduction = window.location.hostname.includes('railway.app') || 
                         window.location.hostname.includes('vercel.app') ||
                         process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      console.error('[ADMIN_IDS] ❌ КРИТИЧЕСКАЯ ОШИБКА: ADMIN_IDS пуст! Автоматический редирект для админов не будет работать.');
      console.error('[ADMIN_IDS] ❌ Установите переменную окружения в Railway:');
      console.error('[ADMIN_IDS]    NEXT_PUBLIC_VITE_ADMIN_IDS=123456789,987654321');
      console.error('[ADMIN_IDS] ❌ Или: VITE_ADMIN_IDS=123456789,987654321');
      console.error('[ADMIN_IDS] ❌ Текущее значение:', adminIdsString || '(пусто)');
    } else {
      console.warn('[ADMIN_IDS] ⚠️ ADMIN_IDS пуст! Автоматический редирект для админов не будет работать.');
      console.warn('[ADMIN_IDS] Установите переменную окружения: NEXT_PUBLIC_VITE_ADMIN_IDS=123456789,987654321');
      console.warn('[ADMIN_IDS] Или: VITE_ADMIN_IDS=123456789,987654321');
      console.warn('[ADMIN_IDS] Текущее значение:', adminIdsString || '(пусто)');
    }
  } else if (process.env.NODE_ENV === 'development') {
    console.log('[ADMIN_IDS] ✅ Загружено ID админов:', ADMIN_IDS);
  }
}
