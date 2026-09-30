const { Router } = require('express');
const widgetController = require('../controllers/widgetController');

const widgetRoutes = Router();

// Получить погоду по адресу
widgetRoutes.get('/weather', widgetController.getWeather);

module.exports = widgetRoutes;
