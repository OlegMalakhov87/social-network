export const SIDEBAR_CONFIG = {
  premium: {
    variant: 'gradient-primary',
    title: '✨ Премиум доступ',
    text: 'Слушайте музыку без рекламы, смотрите видео в 4K и получайте эксклюзивный контент.',
    buttonText: 'Попробовать 30 дней бесплатно',
  },
  ad: {
    title: 'Новая коллекция весна 2026',
    description: 'Скидка 30% на все товары до конца месяца',
    image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=300',
    linkText: 'Перейти в магазин →',
    linkUrl: '#',
  },
  weather: {
    variant: 'gradient-blue',
    temp: '+18°',
    city: 'Москва',
    icon: '☀️',
  },
  popular: {
    title: '🔥 Популярное сейчас',
    items: [
      { icon: '🎵', title: 'Bohemian Rhapsody', sub: 'Queen • 2.3M прослушиваний' },
      { icon: '🎬', title: 'Интерстеллар', sub: '4.8 ★ • 125K просмотров' },
      { icon: '📰', title: 'SpaceX запуск Starship', sub: 'Новости • 1 час назад' },
    ],
  },
  events: {
    title: '📅 Скоро',
    items: [
      { icon: '🎸', title: 'Концерт Imagine Dragons', sub: '25 марта • 19:00' },
      { icon: '🎮', title: 'Релиз GTA VI', sub: 'Совсем скоро' },
    ],
  },
};