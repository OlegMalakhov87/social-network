const { body, param, query, validationResult } = require('express-validator');

/**
 * Валидация для регистрации пользователя
 * @param {Object} req - Объект запроса
 * @param {Object} res - Объект ответа
 * @param {Function} next - Функция для перехода к следующему middleware
 * @returns {Promise<void>}
 */
const validateRegister = [
  body('name')
    .notEmpty()
    .withMessage('Имя обязательно')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Имя от 2 до 100 символов'),
  body('email').isEmail().withMessage('Некорректный email').normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Пароль обязателен')
    .isLength({ min: 6 })
    .withMessage('Пароль должен быть не менее 6 символов'),
  body('nickname')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Никнейм от 2 до 50 символов'),
  body('age')
    .optional()
    .isInt({ min: 14, max: 99 })
    .withMessage('Некорректный возраст'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Ошибка валидации при регистрации',
        details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }
    next();
  },
];

/**
 * Валидация для входа в систему
 * @param {Object} req - Объект запроса
 * @param {Object} res - Объект ответа
 * @param {Function} next - Функция для перехода к следующему middleware
 * @returns {Promise<void>}
 */
const validateLogin = [
  body('email').isEmail().withMessage('Некорректный email').normalizeEmail(),
  body('password').notEmpty().withMessage('Пароль обязателен'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Ошибка валидации при входе в систему',
        details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }
    next();
  },
];

/**
 * Валидация для обновления пользователя
 * @param {Object} req - Объект запроса
 * @param {Object} res - Объект ответа
 * @param {Function} next - Функция для перехода к следующему middleware
 * @returns {Promise<void>}
 */
const validateUser = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Имя от 2 до 100 символов'),
  body('nickname')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Никнейм от 2 до 50 символов'),
  body('age')
    .optional()
    .isInt({ min: 14, max: 99 })
    .withMessage('Некорректный возраст'),
  body('address')
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Адрес до 500 символов'),
  body('job')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Должность до 100 символов'),
  body('status')
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Статус до 500 символов'),
  body('phone')
    .optional()
    .trim()
    .isLength({ min: 5, max: 25 })
    .withMessage('Телефон от 5 до 25 символов'),
  body('isPublic')
    .isBoolean()
    .withMessage('isPublic должен быть true или false'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Ошибка валидации при обновлении пользователя',
        details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }
    next();
  },
];

/**
 * Валидация для постов
 * @param {Object} req - Объект запроса
 * @param {Object} res - Объект ответа
 * @param {Function} next - Функция для перехода к следующему middleware
 * @returns {Promise<void>}
 */
const validatePost = [
  body('text')
    .optional()
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Текст до 5000 символов'),
  body('isPublic')
    .isBoolean()
    .withMessage('isPublic должен быть true или false'),
  body('type')
    .isIn(['text', 'image', 'video'])
    .withMessage('Тип поста должен быть text, image или video'),
  body('pinned').isBoolean().withMessage('pinned должен быть true или false'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Ошибка валидации поста',
        details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }
    next();
  },
];

/**
 * Валидация для комментариев
 * @param {Object} req - Объект запроса
 * @param {Object} res - Объект ответа
 * @param {Function} next - Функция для перехода к следующему middleware
 * @returns {Promise<void>}
 */
const validateComment = [
  body('text')
    .notEmpty()
    .trim()
    .withMessage('Текст обязателен')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Текст до 2000 символов'),
  body('targetType')
    .isIn(['Post', 'Music', 'Video', 'News'])
    .withMessage('Тип сущности должен быть Post, Music, Video или News'),
  body('targetId')
    .isInt({ min: 1 })
    .toInt()
    .withMessage('ID сущности должен быть числом'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Ошибка валидации комментария',
        details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }
    next();
  },
];

/**
 * Валидация для лайков
 * @param {Object} req - Объект запроса
 * @param {Object} res - Объект ответа
 * @param {Function} next - Функция для перехода к следующему middleware
 * @returns {Promise<void>}
 */
const validateLike = [
  body('targetType')
    .isIn(['Post', 'Music', 'Video', 'News', 'Comment', 'Message'])
    .withMessage(
      'Тип сущности должен быть Post, Music, Video, News, Comment или Message'
    ),
  body('targetId')
    .isInt({ min: 1 })
    .toInt()
    .withMessage('ID сущности должен быть числом'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Ошибка валидации лайка',
        details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }
    next();
  },
];

/**
 * Валидация для сообщений
 * @param {Object} req - Объект запроса
 * @param {Object} res - Объект ответа
 * @param {Function} next - Функция для перехода к следующему middleware
 * @returns {Promise<void>}
 */
const validateMessage = [
  body('senderId').isInt({ min: 1 }).toInt(),
  body('content').notEmpty().trim().isLength({ min: 1, max: 2000 }),
  body('receiverId').isInt({ min: 1 }).toInt(),
  body('isRead').isBoolean(),
  body('isEdited').isBoolean(),
  body('deletedBySender').isBoolean(),
  body('deletedByReceiver').isBoolean(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Ошибка валидации сообщения',
        details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }
    next();
  },
];

/**
 * Валидация для музыки
 * @param {Object} req - Объект запроса
 * @param {Object} res - Объект ответа
 * @param {Function} next - Функция для перехода к следующему middleware
 * @returns {Promise<void>}
 */
const validateMusic = [
  body('title')
    .notEmpty()
    .trim()
    .withMessage('Заголовок обязателен')
    .isLength({ min: 1, max: 100 })
    .withMessage('Заголовок до 100 символов'),
  body('artist')
    .notEmpty()
    .trim()
    .withMessage('Исполнитель обязателен')
    .isLength({ min: 1, max: 100 })
    .withMessage('Исполнитель до 100 символов'),
  body('album')
    .optional()
    .trim()
    .withMessage('Альбом до 100 символов')
    .isLength({ min: 1, max: 100 }),
  body('year')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .toInt(),
  body('duration')
    .optional()
    .isInt({ min: 1, max: 3600 })
    .toInt()
    .withMessage('Длительность должна быть числом'),
  body('size')
    .optional()
    .isInt({ min: 1024 })
    .toInt()
    .withMessage('Размер должен быть числом'),
  body('genre')
    .notEmpty()
    .trim()
    .withMessage('Жанр обязателен')
    .isLength({ min: 1, max: 50 })
    .withMessage('Жанр до 50 символов'),
  body('audio')
    .isString()
    .isLength({ min: 1, max: 500 })
    .withMessage('Аудио до 500 символов'),
  body('isPublic')
    .isBoolean()
    .withMessage('isPublic должен быть true или false'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Описание до 2000 символов'),
  body('cover')
    .optional()
    .isString()
    .isLength({ min: 1, max: 500 })
    .withMessage('Обложка до 500 символов'),
  body('playCount')
    .isInt({ min: 0 })
    .toInt()
    .withMessage('Количество просмотров должно быть числом'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Ошибка валидации музыки',
        details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }
    next();
  },
];

/**
 * Валидация для видео
 * @param {Object} req - Объект запроса
 * @param {Object} res - Объект ответа
 * @param {Function} next - Функция для перехода к следующему middleware
 * @returns {Promise<void>}
 */
const validateVideo = [
  body('title')
    .notEmpty()
    .trim()
    .withMessage('Заголовок обязателен')
    .isLength({ min: 1, max: 100 })
    .withMessage('Заголовок до 100 символов'),
  body('description')
    .optional()
    .trim()
    .withMessage('Описание до 2000 символов')
    .isLength({ min: 1, max: 2000 }),
  body('duration')
    .optional()
    .isInt({ min: 1, max: 7200 })
    .toInt()
    .withMessage('Длительность должна быть числом'),
  body('size')
    .optional()
    .isInt({ min: 1024 })
    .toInt()
    .withMessage('Размер должен быть числом'),
  body('year')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .toInt(),
  body('url')
    .isString()
    .isLength({ min: 1, max: 500 })
    .withMessage('URL до 500 символов'),
  body('thumbnailUrl')
    .optional()
    .isString()
    .isLength({ min: 1, max: 500 })
    .withMessage('Обложка до 500 символов'),
  body('category')
    .notEmpty()
    .trim()
    .withMessage('Категория обязательна')
    .isLength({ min: 1, max: 50 })
    .withMessage('Категория до 50 символов'),
  body('isPublic')
    .isBoolean()
    .withMessage('isPublic должен быть true или false'),
  body('viewsCount')
    .isInt({ min: 0 })
    .toInt()
    .withMessage('Количество просмотров должно быть числом'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Ошибка валидации видео',
        details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }
    next();
  },
];

/**
 * Валидация для новостей
 * @param {Object} req - Объект запроса
 * @param {Object} res - Объект ответа
 * @param {Function} next - Функция для перехода к следующему middleware
 * @returns {Promise<void>}
 */
const validateNews = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Заголовок до 100 символов'),
  body('text')
    .optional()
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Текст до 5000 символов'),
  body('date').optional().isDate().withMessage('Некорректная дата'),
  body('author')
    .notEmpty()
    .trim()
    .withMessage('Автор обязателен')
    .isLength({ min: 1, max: 100 })
    .withMessage('Автор до 100 символов'),
  body('category')
    .notEmpty()
    .trim()
    .withMessage('Категория обязательна')
    .isLength({ min: 1, max: 50 })
    .withMessage('Категория до 50 символов'),
  body('type')
    .notEmpty()
    .isIn(['text', 'image', 'video'])
    .withMessage('Тип должен быть text, image или video'),
  body('source')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Источник до 100 символов'),
  body('media')
    .optional()
    .isString()
    .isLength({ min: 1, max: 500 })
    .withMessage('Медиа до 500 символов'),
  body('viewsCount')
    .isInt({ min: 0 })
    .toInt()
    .withMessage('Количество просмотров должно быть числом'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Ошибка валидации новости',
        details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }
    next();
  },
];

/**
 * Валидация ID в параметрах
 * @param {string} paramName - Название параметра
 * @returns {Array} - Массив middleware
 */
const validateIdParam = (paramName) => [
  param(paramName)
    .isInt({ min: 1 })
    .toInt()
    .withMessage(`${paramName} должен быть числом`),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: `Неверный формат ${paramName}`,
        details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }
    next();
  },
];

module.exports = {
  validateRegister,
  validateLogin,
  validateUser,
  validatePost,
  validateComment,
  validateLike,
  validateMessage,
  validateMusic,
  validateVideo,
  validateNews,
  validateIdParam,
};
