/* Функция для форматирования даты */

export const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  if (diff < 86400000) {
    // меньше дня
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  if (diff < 31536000000) {
    // меньше года
    return date.toLocaleDateString([], {
      day: 'numeric',
      month: 'short',
    });
  }
  if (diff >= 31536000000) {
    // больше года
    return date.toLocaleDateString([], {
      month: 'short',
      year: 'numeric',
    });
  }
};
