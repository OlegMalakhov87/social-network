const { Router } = require('express');

const userController = require('../controllers/userController');
const { validateIdParam } = require('../middleware/validation/paramValidation');
const { authMiddleware } = require('../middleware/auth/authMiddleware');
const {
  validateUser,
  validatePasswordChange,
} = require('../middleware/validation/validateUser');
const {
  validatePrivacyUpdate,
} = require('../middleware/validation/validatePrivacyUpdate');
const {
  upload,
  handleUploadError,
} = require('../middleware/upload/uploadMiddleware');
const {
  validateUploadedMedia,
} = require('../middleware/validation/validateUploadedMedia');

const userRoutes = Router();

// Возвращает профиль пользователя и статус дружбы.
userRoutes.get(
  '/:userId/with-friendship-status',
  validateIdParam('userId'),
  authMiddleware,
  userController.getUserProfileWithFriendshipStatus
);

// Проверяет онлайн-статус пользователей.
userRoutes.post(
  '/online-status',
  authMiddleware,
  userController.checkOnlineBulk
);

// Загружает аватар пользователя.
userRoutes.post(
  '/upload-avatar',
  authMiddleware,
  upload.single('avatarUrl'),
  handleUploadError,
  validateUploadedMedia,
  userController.uploadAvatar
);

// Обновляет профиль пользователя.
userRoutes.put(
  '/update',
  authMiddleware,
  validateUser,
  userController.updateUser
);

// Обновляет приватность пользователя.
userRoutes.patch(
  '/update-privacy',
  authMiddleware,
  validatePrivacyUpdate,
  userController.updatePrivacy
);

// Меняет пароль пользователя.
userRoutes.patch(
  '/change-password',
  authMiddleware,
  validatePasswordChange,
  userController.changePassword
);

// Удаляет пользователя.
userRoutes.delete('/delete', authMiddleware, userController.deleteUser);

// Удаляет загруженный аватар.
userRoutes.delete(
  '/delete-uploaded-avatar',
  authMiddleware,
  userController.deleteUploadedAvatar
);

module.exports = userRoutes;
