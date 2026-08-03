const { Router } = require('express');
const userController = require('../controllers/userController');
const {
  validateIdParam,
  validateUser,
} = require('../middleware/validationMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const { upload, handleUploadError } = require('../middleware/uploadMiddleware');

const userRoutes = Router();

// Поиск пользователей
userRoutes.get('/search', authMiddleware, userController.searchUsers);

// Получение всех пользователей
userRoutes.get('/', authMiddleware, userController.getAllUsers);

// Получение пользователя по ID
userRoutes.get(
  '/:userId',
  validateIdParam('userId'),
  authMiddleware,
  userController.getUserById
);

// Проверка онлайн статуса пользователей
userRoutes.post(
  '/online-status',
  authMiddleware,
  userController.checkOnlineBulk
);

// Создание пользователя
userRoutes.post('/', validateUser, userController.createUser);

// Загрузка аватара пользователя
userRoutes.post(
  '/upload-avatar',
  authMiddleware,
  upload.single('avatar'),
  handleUploadError,
  userController.uploadAvatar
);

// Обновление пользователя
userRoutes.patch(
  '/update',
  authMiddleware,
  validateUser,
  userController.updateUser
);

// Удаление пользователя
userRoutes.delete('/delete', authMiddleware, userController.deleteUser);

// Изменение пароля пользователя
userRoutes.patch(
  '/change-password',
  authMiddleware,
  userController.changePassword
);

module.exports = userRoutes;
