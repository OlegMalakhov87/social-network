export { api } from './api'; // API для взаимодействия с сервером
export { setupAxiosInterceptors } from './apiAxios'; // Axios клиент для взаимодействия с сервером и настройка интерцепторов
export { dispatchAuthLogout } from './authSession'; // Экшен logout без импорта authSlice (избегаем циклических зависимостей)
export { authAxios } from './authAxios'; // Axios клиент для операций с refresh-сессией
