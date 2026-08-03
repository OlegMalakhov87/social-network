const { Router } = require('express');
const userVideoLibraryController = require('../controllers/userVideoLibraryController');
const { validateIdParam } = require('../middleware/validationMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

const userVideoLibraryRoutes = Router();

// Получить мою библиотеку видео
userVideoLibraryRoutes.get(
  '/',
  authMiddleware,
  userVideoLibraryController.getMyLibrary
);

// Добавить видео в библиотеку
userVideoLibraryRoutes.post(
  '/',
  authMiddleware,
  userVideoLibraryController.addToLibrary
);

// Обновить запись в библиотеке (избранное, счетчик просмотров, время просмотра)
userVideoLibraryRoutes.put(
  '/:libraryId',
  validateIdParam('libraryId'),
  authMiddleware,
  userVideoLibraryController.updateLibraryItem
);

// Удалить видео из библиотеки
userVideoLibraryRoutes.delete(
  '/:libraryId',
  validateIdParam('libraryId'),
  authMiddleware,
  userVideoLibraryController.removeFromLibrary
);

module.exports = userVideoLibraryRoutes;
