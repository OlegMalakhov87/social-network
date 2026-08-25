const { Router } = require('express');
const userVideoLibraryController = require('../controllers/userVideoLibraryController');
const { validateIdParam } = require('../middleware/validationMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

const userVideoLibraryRoutes = Router();

// Получить мою библиотеку видео
userVideoLibraryRoutes.get(
  '/',
  authMiddleware,
  userVideoLibraryController.getMyVideoLibrary
);

// Получить библиотеку выбранного пользователя
userVideoLibraryRoutes.get(
  '/:userId',
  validateIdParam('userId'),
  authMiddleware,
  userVideoLibraryController.getUserVideosLibrary
);

// Добавить видео в библиотеку
userVideoLibraryRoutes.post(
  '/:videoId/add',
  validateIdParam('videoId'),
  authMiddleware,
  userVideoLibraryController.addToVideoLibrary
);

// Обновить запись в библиотеке (избранное)
userVideoLibraryRoutes.put(
  '/:libraryId/favorite',
  validateIdParam('libraryId'),
  authMiddleware,
  userVideoLibraryController.updateFavoriteVideo
);

// Увеличить счетчик просмотров видео в библиотеке
userVideoLibraryRoutes.put(
  '/:libraryId/views',
  validateIdParam('libraryId'),
  authMiddleware,
  userVideoLibraryController.incrementViewsCount
);

// Удалить видео из библиотеки
userVideoLibraryRoutes.delete(
  '/:libraryId/delete',
  validateIdParam('libraryId'),
  authMiddleware,
  userVideoLibraryController.deleteVideoFromLibrary
);

module.exports = userVideoLibraryRoutes;
