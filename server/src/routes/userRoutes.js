const { Router } = require('express');
const userController = require('../controllers/userController');
const { validateIdParam } = require('../middleware/validation/paramValidation');
const { authMiddleware } = require('../middleware/auth/authMiddleware');
const {
  validateUser,
  validatePasswordChange,
} = require('../middleware/validation/userValidation');
const {
  validatePrivacyUpdate,
} = require('../middleware/validation/validatePrivacyUpdate');
const {
  upload,
  handleUploadError,
} = require('../middleware/upload/uploadMiddleware');

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
userRoutes.put(
  '/update',
  authMiddleware,
  validateUser,
  userController.updateUser
);

// Обновление приватности пользователя
userRoutes.patch(
  '/update-privacy',
  authMiddleware,
  validatePrivacyUpdate,
  userController.updatePrivacy
);

// Изменение пароля пользователя
userRoutes.patch(
  '/change-password',
  authMiddleware,
  validatePasswordChange,
  userController.changePassword
);

// Удаление пользователя
userRoutes.delete('/delete', authMiddleware, userController.deleteUser);

// Удаление загруженного аватара
userRoutes.delete(
  '/delete-uploaded-avatar',
  authMiddleware,
  userController.deleteUploadedAvatar
);

module.exports = userRoutes;
