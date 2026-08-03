const { Router } = require('express');
const userMusicLibraryController = require('../controllers/userMusicLibraryController');
const { validateIdParam } = require('../middleware/validationMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

const userMusicLibraryRoutes = Router();

// Получить мою библиотеку
userMusicLibraryRoutes.get(
  '/',
  authMiddleware,
  userMusicLibraryController.getMyLibrary
);

// Добавить трек в библиотеку
userMusicLibraryRoutes.post(
  '/',
  authMiddleware,
  userMusicLibraryController.addToLibrary
);

// Обновить запись в библиотеке (лайк, счетчик прослушиваний)
userMusicLibraryRoutes.put(
  '/:libraryId',
  validateIdParam('libraryId'),
  authMiddleware,
  userMusicLibraryController.updateLibraryItem
);

// Удалить трек из библиотеки
userMusicLibraryRoutes.delete(
  '/:libraryId',
  validateIdParam('libraryId'),
  authMiddleware,
  userMusicLibraryController.removeFromLibrary
);

module.exports = userMusicLibraryRoutes;
