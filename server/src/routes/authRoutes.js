const { Router } = require('express');

const { authMiddleware } = require('../middleware/auth/authMiddleware');
const { verifyAuthOrigin } = require('../middleware/auth/verifyAuthOrigin');
const {
  validateRegister,
  validateLogin,
} = require('../middleware/validation/validateUser');
const {
  loginLimiter,
  registerLimiter,
  refreshLimiter,
} = require('../middleware/validation/rateLimit');
const authController = require('../controllers/authController');

const authRouter = Router();

// Возвращает данные текущего пользователя.
authRouter.get('/me', authMiddleware, authController.getMe);

// Регистрирует пользователя.
authRouter.post(
  '/register',
  registerLimiter,
  validateRegister,
  authController.register
);

// Выполняет вход.
authRouter.post('/login', loginLimiter, validateLogin, authController.login);

// Обновляет маркер доступа.
authRouter.post(
  '/refresh',
  refreshLimiter,
  verifyAuthOrigin,
  authController.refresh
);

// Завершает сессию.
authRouter.post('/logout', verifyAuthOrigin, authController.logout);

module.exports = authRouter;
