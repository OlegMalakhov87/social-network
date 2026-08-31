const { Router } = require('express');
const userController = require('../controllers/userController');
const {
  validateIdParam,
  validateUser,
} = require('../middleware/validationMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const { upload, handleUploadError } = require('../middleware/uploadMiddleware');

const userRoutes = Router();

// Получить данные о пользователе и статусе дружбы
userRoutes.get(
  '/:userId/with-friendship-status',
  validateIdParam('userId'),
  authMiddleware,
  userController.getUserProfileWithFriendshipStatus
);

// Проверка онлайн статуса пользователей
userRoutes.post(
  '/online-status',
  authMiddleware,
  userController.checkOnlineBulk
);

// Загрузка аватара пользователя
userRoutes.post(
  '/upload-avatar',
  authMiddleware,
  upload.single('avatarUrl'),
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

// Обновление приватности пользователя
userRoutes.put('/update-privacy', authMiddleware, userController.updatePrivacy);

// Удаление пользователя
userRoutes.delete('/delete', authMiddleware, userController.deleteUser);

// Изменение пароля пользователя
userRoutes.patch(
  '/change-password',
  authMiddleware,
  userController.changePassword
);

module.exports = userRoutes;
