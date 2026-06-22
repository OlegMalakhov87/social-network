const { Router } = require('express');
const newsControllers = require('../controllers/newsController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateIdParam } = require('../middleware/validationMiddleware');

const newsRoutes = Router();

newsRoutes.get('/search', authMiddleware, newsControllers.searchNews);

newsRoutes.get('/', authMiddleware, newsControllers.getAllNews);

newsRoutes.get('/:newsId', validateIdParam('newsId'), authMiddleware, newsControllers.getNewsById);

newsRoutes.get('/category/:category', authMiddleware, newsControllers.getCategoryNews);

newsRoutes.post('/', authMiddleware, newsControllers.createNews);

newsRoutes.put('/:newsId/view', authMiddleware, newsControllers.incrementViewCount);

newsRoutes.put('/:newsId', validateIdParam('newsId'), authMiddleware, newsControllers.updateNews);

newsRoutes.delete(
  '/:newsId',
  validateIdParam('newsId'),
  authMiddleware,
  newsControllers.deleteNews
);

module.exports = newsRoutes;
