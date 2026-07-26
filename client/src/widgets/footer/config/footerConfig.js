/**
 * Конфигурация футера приложения.
 * Вынесена отдельно для удобства поддержки и переиспользования.
 */

export const SOCIAL_LINKS = [
  { label: 'Twitter', url: 'https://twitter.com', icon: '𝕏' },
  { label: 'GitHub', url: 'https://github.com', icon: 'GitHub' },
  { label: 'Telegram', url: 'https://telegram.org', icon: 'Telegram' },
  { label: 'YouTube', url: 'https://youtube.com', icon: 'YouTube' },
];

export const COMPANY_LINKS = [
  { label: 'О нас', path: '/about' },
  { label: 'Команда', path: '/team' },
  { label: 'Блог', path: '/blog' },
  { label: 'Пресса', path: '/press' },
  { label: 'Карьера', path: '/careers' },
];

export const PRODUCT_LINKS = [
  { label: 'Возможности', path: '/features' },
  { label: 'Безопасность', path: '/security' },
  { label: 'Тарифы', path: '/pricing' },
  { label: 'Обновления', path: '/updates' },
  { label: 'Roadmap', path: '/roadmap' },
];

export const LEGAL_LINKS = [
  { label: 'Политика конфиденциальности', path: '/privacy' },
  { label: 'Условия использования', path: '/terms' },
  { label: 'Cookies', path: '/cookies' },
];

export const CONTACT_INFO = [
  { icon: '📍', text: 'г. Смоленск, пр-т Строителей, 1/42' },
  { icon: '📧', text: 'support@socialnetwork.ru', href: 'mailto:malahov.1987@mail.ru' },
  { icon: '📞', text: '+7 (915) 654-88-42', href: 'tel:+79156548842' },
  { icon: '⏰', text: 'Пн-Пт: 08:00 - 20:00' },
];