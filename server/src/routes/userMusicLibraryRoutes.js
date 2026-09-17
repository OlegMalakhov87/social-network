const { Router } = require('express');
const userMusicLibraryController = require('../controllers/userMusicLibraryController');
const { validateIdParam } = require('../middleware/validation/paramValidation');
const { authMiddleware } = require('../middleware/auth/authMiddleware');
const {
  validateFavoriteUpdate,
} = require('../middleware/validation/validateFavoriteUpdate');

const userMusicLibraryRoutes = Router();

// Получить мою библиотеку треков
userMusicLibraryRoutes.get(
  '/',
  authMiddleware,
  userMusicLibraryController.getMyMusicLibrary
);

// Получить библиотеку выбранного пользователя
userMusicLibraryRoutes.get(
  '/:userId',
  validateIdParam('userId'),
  authMiddleware,
  userMusicLibraryController.getUserMusicLibrary
);

// Добавить трек в библиотеку
userMusicLibraryRoutes.post(
  '/:trackId/add',
  validateIdParam('trackId'),
  authMiddleware,
  userMusicLibraryController.addToMusicLibrary
);

// Обновить запись в библиотеке (избранное)
userMusicLibraryRoutes.patch(
  '/:libraryId/favorite',
  validateIdParam('libraryId'),
  authMiddleware,
  validateFavoriteUpdate,
  userMusicLibraryController.updateFavoriteTrack
);

// Увеличить счетчик прослушиваний трека из библиотеки
userMusicLibraryRoutes.patch(
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
