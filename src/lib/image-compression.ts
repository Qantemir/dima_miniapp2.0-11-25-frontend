/**
 * Утилита для сжатия изображений на клиенте
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeKB?: number; // Максимальный размер в КБ, если меньше - не сжимаем
}

/**
 * Сжимает изображение используя Canvas API
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<string> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.85,
    maxSizeKB = 100,
  } = options;

  // Если файл уже маленький, возвращаем как есть
  if (file.size < maxSizeKB * 1024) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Вычисляем новые размеры
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = width * ratio;
        height = height * ratio;
      }

      // Создаем canvas для сжатия
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Не удалось создать canvas context'));
        return;
      }

      // Рисуем изображение на canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Определяем формат (JPEG для фото, PNG для прозрачных)
      const isPng = file.type === 'image/png';
      const outputFormat = isPng ? 'image/png' : 'image/jpeg';
      const outputQuality = isPng ? undefined : quality;

      // Конвертируем в base64
      const compressedDataUrl = canvas.toDataURL(outputFormat, outputQuality);
      
      // Проверяем, что сжатие дало результат
      const compressedSize = compressedDataUrl.length * 0.75; // Примерный размер base64
      if (compressedSize >= file.size) {
        // Если сжатие не помогло, возвращаем оригинал
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      } else {
        resolve(compressedDataUrl);
      }
    };

    img.onerror = () => reject(new Error('Ошибка при загрузке изображения'));
    
    // Загружаем изображение
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };
    reader.onerror = () => reject(new Error('Ошибка при чтении файла'));
    reader.readAsDataURL(file);
  });
}

/**
 * Сжимает несколько изображений параллельно
 */
export async function compressImages(
  files: File[],
  options?: CompressionOptions,
  onProgress?: (current: number, total: number) => void
): Promise<string[]> {
  const results: string[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const compressed = await compressImage(files[i], options);
    results.push(compressed);
    onProgress?.(i + 1, files.length);
  }
  
  return results;
}








