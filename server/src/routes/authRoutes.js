const { Router } = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');

const authRouter = Router();

authRouter.get('/me', authMiddleware, authController.getMe);
authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);

module.exports = authRouter;
