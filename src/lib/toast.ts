// Лёгкий fallback-тост без сторонних зависимостей,
// чтобы фронт продолжал работать даже без sonner.
// В проде можно вернуть sonner, но сейчас важно убрать рантайм-ошибку.
const log = (prefix: string, message: string) => {
  // Логируем только ошибки
  if (prefix === '❌') {
    console.error(prefix, message);
  }
  // В production можно интегрировать с системой мониторинга
  if (process.env.NODE_ENV === 'production') {
    // Можно отправить в Sentry, LogRocket и т.д.
  }
};

export const toast = {
  success: (message: string) => log("✅", message),
  error: (message: string) => log("❌", message),
  info: (message: string) => log("ℹ️", message),
  warning: (message: string) => log("⚠️", message),
  // Для обратной совместимости - показываем как info
  show: (message: string) => log("ℹ️", message),
};

