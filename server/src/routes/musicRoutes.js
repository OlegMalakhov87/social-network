const { Router } = require('express');
const musicController = require('../controllers/musicController');
const { validateMedia, validateIdParam } = require('../middleware/validationMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const { checkMusicOwnership } = require('../middleware/ownershipMiddleware');

const musicRoutes = Router();

musicRoutes.get('/search', authMiddleware, musicController.searchMusic);

musicRoutes.get('/', authMiddleware, musicController.getAllMusic);

musicRoutes.get(
  '/profile/:userId',
  validateIdParam('userId'),
  authMiddleware,
  musicController.getUserMusic
);

musicRoutes.get(
  '/:trackId',
  validateIdParam('trackId'),
  authMiddleware,
  musicController.getMusicById
);

musicRoutes.post('/', authMiddleware, validateMedia, musicController.createMusic);

musicRoutes.put(
  '/:trackId',
  validateIdParam('trackId'),
  authMiddleware,
  musicController.incrementPlayCount
);

musicRoutes.delete(
  '/:trackId',
  validateIdParam('trackId'),
  authMiddleware,
  checkMusicOwnership,
  musicController.deleteMusic
);

module.exports = musicRoutes;
