const { Router } = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  validateRegister,
  validateLogin,
} = require('../middleware/validationMiddleware');
const authController = require('../controllers/authController');

const authRouter = Router();

// Получение информации о текущем пользователе
authRouter.get('/me', authMiddleware, authController.getMe);

// Регистрация пользователя
authRouter.post('/register', validateRegister, authController.register);

// Вход в систему
authRouter.post('/login', validateLogin, authController.login);

module.exports = authRouter;
