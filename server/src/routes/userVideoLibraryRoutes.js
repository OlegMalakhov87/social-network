const { Router } = require('express');

const userVideoLibraryController = require('../controllers/userVideoLibraryController');
const { validateIdParam } = require('../middleware/validation/paramValidation');
const { authMiddleware } = require('../middleware/auth/authMiddleware');

const userVideoLibraryRoutes = Router();

// Возвращает библиотеку видео текущего пользователя.
userVideoLibraryRoutes.get(
  '/',
  authMiddleware,
  userVideoLibraryController.getMyVideoLibrary
);

// Возвращает библиотеку выбранного пользователя.
userVideoLibraryRoutes.get(
  '/:userId',
  validateIdParam('userId'),
  authMiddleware,
  userVideoLibraryController.getUserVideosLibrary
);

// Добавляет видео в библиотеку.
userVideoLibraryRoutes.post(
  '/:videoId/add',
  validateIdParam('videoId'),
  authMiddleware,
  userVideoLibraryController.addToVideoLibrary
);

// Обновляет признак избранного в библиотеке.
userVideoLibraryRoutes.patch(
  '/:libraryId/favorite',
  validateIdParam('libraryId'),
  authMiddleware,
  userVideoLibraryController.updateFavoriteVideo
);

// Увеличивает счетчик просмотров видео в библиотеке.
userVideoLibraryRoutes.patch(
  '/:libraryId/views',
  validateIdParam('libraryId'),
  authMiddleware,
  userVideoLibraryController.incrementViewsCount
);

// Удаляет видео из библиотеки.
userVideoLibraryRoutes.delete(
  '/:libraryId/delete',
  validateIdParam('libraryId'),
  authMiddleware,
  userVideoLibraryController.deleteVideoFromLibrary
);

module.exports = userVideoLibraryRoutes;
