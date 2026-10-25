export * from './apiError'; // Преобразует ошибки API в сообщение и ошибки полей.
export { apiFetchItems } from './apiFetchItems'; // Возвращает страницу элементов с сервера.
export { createAuthRefreshChannel } from './authRefreshChannel'; // Обменивается сообщениями об авторизации между вкладками.
export { withAuthRefreshLock } from './authRefreshLock'; // Выполняет операцию под исключительной блокировкой вкладок.
export { createAbortableFetch } from './createAbortableFetch'; // Создаёт контроллер отмены для последовательных запросов.
export { createNotifier } from './createNotifier'; // Создаёт методы показа уведомлений.
export { extractPaginatedItems } from './extractPaginatedItems'; // Извлекает элементы и сведения о страницах из ответа сервера.
export * from './fieldValidators'; // Проверяет строковые поля формы.
export * from './fileValidators'; // Проверяет файлы перед загрузкой.
export * from './mediaValidators'; // Проверяет длительность, разрешение и соотношение сторон медиафайлов.
export * from './theme'; // Сохраняет предпочтение темы и применяет его к документу.
