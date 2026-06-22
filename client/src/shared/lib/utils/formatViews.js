/* Функция для форматирования количества просмотров  */

export const formatViews = (views) => {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)} млн`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)} тыс`;
  return views;
};
