export { fetchWeatherApi } from './api/weatherApi'; // API для получения погоды по адресу пользователя

export * from './config/weatherWidgetConfig'; // Конфиг рендера строк виджета погоды
export { useWeather } from './model/useWeather'; // Хук для получения погоды по адресу пользователя
export { WeatherSchema } from './model/weatherSchema'; // Схема для валидации данных о погоде

export { WeatherWidget } from './ui/WeatherWidget'; // Компонент для отображения погоды
