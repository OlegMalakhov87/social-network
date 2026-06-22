const { Router } = require('express');
const videoController = require('../controllers/videoController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateIdParam, validateMedia } = require('../middleware/validationMiddleware');
const { checkVideoOwnership } = require('../middleware/ownershipMiddleware');

const videoRoutes = Router();

videoRoutes.get('/search', authMiddleware, videoController.searchVideo);

videoRoutes.get('/', authMiddleware, videoController.getAllVideos);

videoRoutes.get(
  '/profile/:userId',
  validateIdParam('userId'),
  authMiddleware,
  videoController.getUserVideos
);

videoRoutes.get(
  '/:videoId',
  validateIdParam('videoId'),
  authMiddleware,
  videoController.getVideoById
);

videoRoutes.post('/', authMiddleware, validateMedia, videoController.createVideo);

videoRoutes.put(
  '/:videoId',
  validateIdParam('videoId'),
  authMiddleware,
  videoController.incrementViewCount
);

videoRoutes.delete(
  '/:videoId',
  validateIdParam('videoId'),
  authMiddleware,
  checkVideoOwnership,
  videoController.deleteVideo
);

module.exports = videoRoutes;
