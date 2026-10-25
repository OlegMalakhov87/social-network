const weatherService = require('../services/weatherService');
const {
  isValidLatitude,
  isValidLongitude,
  parseCoordinate,
} = require('../utils/weatherUtils');

const widgetController = {
  /**
   * Возвращает погоду по координатам запроса.
   *
   * @param {import('express').Request} req - Запрос Express
   * @param {import('express').Response} res - Ответ Express
   * @param {import('express').NextFunction} next - Следующий промежуточный обработчик
   * @returns {Promise<void>} Завершает ответ или передает ошибку дальше.
   */
  getWeather: async (req, res, next) => {
    try {
      const { lat, lon } = req.query;
      const parsedLat = parseCoordinate(lat);
      const parsedLon = parseCoordinate(lon);
      const hasValidCoords =
        isValidLatitude(parsedLat) && isValidLongitude(parsedLon);

      if (!hasValidCoords) {
        return res.status(400).json({
          error: 'Не переданы координаты',
          code: 'INVALID_COORDS',
        });
      }

      const result = await weatherService.getWeatherByCoords(
        parsedLat,
        parsedLon
      );

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = widgetController;
