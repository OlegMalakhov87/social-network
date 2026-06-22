const { Router } = require('express');
const friendController = require('../controllers/friendController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateIdParam } = require('../middleware/validationMiddleware');

const friendRoutes = Router();

friendRoutes.get(
  '/with-friendship-status',
  authMiddleware,
  friendController.getUsersWithFriendshipStatus
);

friendRoutes.get(
  '/status/:userId',
  validateIdParam('userId'),
  authMiddleware,
  friendController.getFriendshipStatus
);

friendRoutes.get('/', authMiddleware, friendController.getAllFriends);

friendRoutes.get('/friends-of-friends', authMiddleware, friendController.getFriendsOfFriends);

friendRoutes.get('/requests-incoming', authMiddleware, friendController.getIncomingRequests);

friendRoutes.get('/requests-outgoing', authMiddleware, friendController.getOutgoingRequests);

friendRoutes.post('/', authMiddleware, friendController.createRequest);
friendRoutes.post('/block', authMiddleware, friendController.blockedUser);

friendRoutes.put(
  '/:friendshipId/accept',
  validateIdParam('friendshipId'),
  authMiddleware,
  friendController.updateRequest
);

friendRoutes.delete(
  '/:friendshipId/reject',
  validateIdParam('friendshipId'),
  authMiddleware,
  friendController.deleteRequest
);

friendRoutes.delete(
  '/:friendshipId',
  validateIdParam('friendshipId'),
  authMiddleware,
  friendController.deleteFriend
);

module.exports = friendRoutes;
