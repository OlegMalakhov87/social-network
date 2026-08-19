const { Router } = require('express');
const userMusicLibraryController = require('../controllers/userMusicLibraryController');
const { validateIdParam } = require('../middleware/validationMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

const userMusicLibraryRoutes = Router();

// Получить мою библиотеку
userMusicLibraryRoutes.get(
  '/',
  authMiddleware,
  userMusicLibraryController.getMyMusicLibrary
);

// Добавить трек в библиотеку
userMusicLibraryRoutes.post(
  '/:trackId/add',
  validateIdParam('trackId'),
  authMiddleware,
  userMusicLibraryController.addToMusicLibrary
);

// Обновить запись в библиотеке (избранное)
userMusicLibraryRoutes.put(
  '/:libraryId/favorite',
  validateIdParam('libraryId'),
  authMiddleware,
  userMusicLibraryController.updateFavoriteTrack
);

// Увеличить счетчик прослушиваний трека из библиотеки
userMusicLibraryRoutes.put(
  '/:libraryId/plays',
  validateIdParam('libraryId'),
  authMiddleware,
  userMusicLibraryController.incrementPlaysCount
);

// Удалить трек из библиотеки
userMusicLibraryRoutes.delete(
  '/:libraryId/delete',
  validateIdParam('libraryId'),
  authMiddleware,
  userMusicLibraryController.deleteMusicFromLibrary
);

module.exports = userMusicLibraryRoutes;
