const { Router } = require('express');

const userMusicLibraryController = require('../controllers/userMusicLibraryController');
const { validateIdParam } = require('../middleware/validation/paramValidation');
const { authMiddleware } = require('../middleware/auth/authMiddleware');
const {
  validateFavoriteUpdate,
} = require('../middleware/validation/validateFavoriteUpdate');

const userMusicLibraryRoutes = Router();

// Возвращает библиотеку треков текущего пользователя.
userMusicLibraryRoutes.get(
  '/',
  authMiddleware,
  userMusicLibraryController.getMyMusicLibrary
);

// Возвращает библиотеку выбранного пользователя.
userMusicLibraryRoutes.get(
  '/:userId',
  validateIdParam('userId'),
  authMiddleware,
  userMusicLibraryController.getUserMusicLibrary
);

// Добавляет трек в библиотеку.
userMusicLibraryRoutes.post(
  '/:trackId/add',
  validateIdParam('trackId'),
  authMiddleware,
  userMusicLibraryController.addToMusicLibrary
);

// Обновляет признак избранного в библиотеке.
userMusicLibraryRoutes.patch(
  '/:libraryId/favorite',
  validateIdParam('libraryId'),
  authMiddleware,
  validateFavoriteUpdate,
  userMusicLibraryController.updateFavoriteTrack
);

// Увеличивает счетчик прослушиваний трека в библиотеке.
userMusicLibraryRoutes.patch(
  '/:libraryId/plays',
  validateIdParam('libraryId'),
  authMiddleware,
  userMusicLibraryController.incrementPlaysCount
);

// Удаляет трек из библиотеки.
userMusicLibraryRoutes.delete(
  '/:libraryId/delete',
  validateIdParam('libraryId'),
  authMiddleware,
  userMusicLibraryController.deleteMusicFromLibrary
);

module.exports = userMusicLibraryRoutes;
