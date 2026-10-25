const { Router } = require('express');

const { authMiddleware } = require('../middleware/auth/authMiddleware');
const { verifyAuthOrigin } = require('../middleware/auth/verifyAuthOrigin');
const {
  validateRegister,
  validateLogin,
} = require('../middleware/validation/validateUser');
const authController = require('../controllers/authController');

const authRouter = Router();

// Возвращает данные текущего пользователя.
authRouter.get('/me', authMiddleware, authController.getMe);

// Регистрирует пользователя.
authRouter.post('/register', validateRegister, authController.register);

// Выполняет вход.
authRouter.post('/login', validateLogin, authController.login);

// Обновляет маркер доступа.
authRouter.post('/refresh', verifyAuthOrigin, authController.refresh);

// Завершает сессию.
authRouter.post('/logout', verifyAuthOrigin, authController.logout);

module.exports = authRouter;
