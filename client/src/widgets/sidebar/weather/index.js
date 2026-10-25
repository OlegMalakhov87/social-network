export { fetchWeatherApi } from './api/weatherApi'; // Запрашивает погоду по координатам через API.

export * from './config/weatherWidgetConfig'; // Содержит поля метаданных погоды и времени солнца.
export { useWeather } from './model/useWeather'; // Возвращает состояние погоды по координатам.
export { WeatherSchema } from './model/weatherSchema'; // Проверяет ответ API погоды.

export { WeatherWidget } from './ui/WeatherWidget'; // Отображает погоду в боковой панели.
