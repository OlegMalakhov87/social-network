const { Router } = require('express');

const widgetController = require('../controllers/widgetController');
const {
  validateWeather,
} = require('../middleware/validation/weatherValidation');

const widgetRoutes = Router();

// Возвращает погоду по координатам.
widgetRoutes.get('/weather', validateWeather, widgetController.getWeather);

module.exports = widgetRoutes;
