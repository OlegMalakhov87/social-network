const { Router } = require('express');
const { authMiddleware } = require('../middleware/auth/authMiddleware');
const { verifyAuthOrigin } = require('../middleware/auth/verifyAuthOrigin');
const {
  validateRegister,
  validateLogin,
} = require('../middleware/validation/validateUser');
const authController = require('../controllers/authController');

const authRouter = Router();

// Получение информации о текущем пользователе
authRouter.get('/me', authMiddleware, authController.getMe);

// Регистрация пользователя
authRouter.post('/register', validateRegister, authController.register);

// Вход в систему
authRouter.post('/login', validateLogin, authController.login);

// Обновление токена
authRouter.post('/refresh', verifyAuthOrigin, authController.refresh);

// Выход из системы
authRouter.post('/logout', verifyAuthOrigin, authController.logout);

module.exports = authRouter;
