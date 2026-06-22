const { Router } = require('express');
const userVideoLibraryController = require('../controllers/userVideoLibraryController');
const { validateIdParam } = require('../middleware/validationMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

const userVideoLibraryRoutes = Router();

userVideoLibraryRoutes.get('/', authMiddleware, userVideoLibraryController.getUserLibrary);

userVideoLibraryRoutes.post('/', authMiddleware, userVideoLibraryController.createUserLibrary);

userVideoLibraryRoutes.delete(
  '/:libraryId',
  validateIdParam('libraryId'),
  authMiddleware,
  userVideoLibraryController.deleteUserLibrary
);

userVideoLibraryRoutes.put(
  '/:libraryId',
  validateIdParam('libraryId'),
  authMiddleware,
  userVideoLibraryController.updateUserLibrary
);

userVideoLibraryRoutes.put(
  '/:libraryId/watch',
  validateIdParam('libraryId'),
  authMiddleware,
  userVideoLibraryController.updateСounters
);

module.exports = userVideoLibraryRoutes;
