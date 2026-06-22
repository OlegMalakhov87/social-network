const { Router } = require('express');
const { validateIdParam } = require('../middleware/validationMiddleware');
const userMusicLibraryController = require('../controllers/userMusicLibraryController');
const authMiddleware = require('../middleware/authMiddleware');

const userMusicLibraryRoutes = Router();

userMusicLibraryRoutes.get('/', authMiddleware, userMusicLibraryController.getUserLibrary);

userMusicLibraryRoutes.post('/', authMiddleware, userMusicLibraryController.createUserLibrary);

userMusicLibraryRoutes.delete(
  '/:libraryId',
  validateIdParam('libraryId'),
  authMiddleware,
  userMusicLibraryController.deleteUserLibrary
);

userMusicLibraryRoutes.put(
  '/:libraryId',
  validateIdParam('libraryId'),
  authMiddleware,
  userMusicLibraryController.updateUserLibrary
);
module.exports = userMusicLibraryRoutes;
