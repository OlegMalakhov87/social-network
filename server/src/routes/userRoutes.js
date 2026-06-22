const { Router } = require('express');
const userController = require('../controllers/userController');
const { validateIdParam, validateUser } = require('../middleware/validationMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

const userRoutes = Router();

userRoutes.get('/search', authMiddleware, userController.searchUsers);

userRoutes.get('/', authMiddleware, userController.getAllUsers);

userRoutes.get('/:userId', validateIdParam('userId'), authMiddleware, userController.getUserById);

userRoutes.post('/online-status', authMiddleware, userController.checkOnlineBulk);

userRoutes.post('/', validateUser, userController.createUser);

userRoutes.put('/update', authMiddleware, validateUser, userController.updateUser);

userRoutes.delete('/delete', authMiddleware, userController.deleteUser);

userRoutes.put('/update-password', authMiddleware, userController.changePassword);

module.exports = userRoutes;
