const { body, param, query, validationResult } = require('express-validator');

/**
 * Валидация для регистрации пользователя
 */
const validateRegister = [
  body('name')
    .notEmpty()
    .isString()
    .withMessage('Имя обязательно')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Имя от 1 до 100 символов'),
  body('email').isEmail().withMessage('Некорректный email').normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Пароль обязателен')
    .isLength({ min: 6 })
    .withMessage('Пароль должен быть не менее 6 символов'),
  body('gender')
    .notEmpty()
    .withMessage('Пол обязателен')
    .isIn(['male', 'female'])
    .withMessage('Пол должен быть male или female'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Ошибка регистрации',
        details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }
    next();
  },
];

/**
 * Валидация для входа в систему
 */
const validateLogin = [
  body('email').isEmail().withMessage('Некорректный email').normalizeEmail(),
  body('password').notEmpty().withMessage('Пароль обязателен'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Ошибка входа в систему',
        details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }
    next();
  },
];

/**
 * Валидация для обновления пользователя
 */
const validateUser = [
  body('name')
    .notEmpty()
    .withMessage('Имя обязательно')
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Имя от 1 до 100 символов'),
  body('avatarUrl')
    .notEmpty()
    .withMessage('Аватар URL обязателен')
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Аватар URL до 500 символов'),
  body('nickname')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Никнейм от 1 до 100 символов'),
  body('birthDate')
    .optional({ nullable: true })
    .isDate()
    .withMessage('Некорректная дата'),
  body('email').isEmail().withMessage('Некорректный email').normalizeEmail(),
  body('address')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Адрес до 500 символов'),
  body('job')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Должность до 100 символов'),
  body('status')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Статус до 500 символов'),
  body('phone')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 12, max: 18 })
    .withMessage('Телефон от 12 до 18 символов'),
  body('isPublic')
    .isBoolean()
    .withMessage('isPublic должен быть true или false'),
  body('gender')
    .notEmpty()
    .withMessage('Пол обязателен')
    .isIn(['male', 'female'])
    .withMessage('Пол должен быть male или female'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Ошибка обновления пользователя',
        details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }
    next();
  },
];

/**
 * Валидация для постов
 */
const validatePost = [
  body('text')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Текст от 1 до 5000 символов'),
  body('isPublic')
    .isBoolean()
    .withMessage('isPublic должен быть true или false'),
  body('type')
    .isIn(['text', 'image', 'video'])
    .withMessage('Тип поста должен быть text, image или video'),
  body('pinned').isBoolean().withMessage('pinned должен быть true или false'),
  body('postUrl')
    .optional({ nullable: true })
    .isString()
    .isLength({ min: 1, max: 500 })
    .withMessage('Пост URL до 500 символов'),
  body('isEdited')
    .isBoolean()
    .withMessage('isEdited должен быть true или false'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Ошибка создания поста',
        details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }
    next();
  },
];

/**
 * Валидация для комментариев
 */
const validateComment = [
  body('text')
    .notEmpty()
    .isString()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Текст обязателен и должен быть от 1 до 2000 символов'),
  body('targetType')
    .isIn(['posts', 'tracks', 'videos', 'news'])
    .withMessage('Тип сущности должен быть posts, tracks, videos или news'),
  body('targetId')
    .isInt({ min: 1 })
    .toInt()
    .withMessage('ID сущности должен быть числом'),
  body('isEdited')
    .isBoolean()
    .withMessage('isEdited должен быть true или false'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Ошибка добавления комментария',
        details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }
    next();
  },
];

/**
 * Валидация для лайков
 */
const validateLike = [
  param('targetType')
    .isIn(['posts', 'tracks', 'videos', 'news', 'comments', 'messages'])
    .withMessage(
      'Тип сущности должен быть posts, tracks, videos, news, comments или messages'
    ),
  param('targetId')
    .isInt({ min: 1 })
    .toInt()
    .withMessage('ID сущности должен быть числом'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Ошибка лайка',
        details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }
    next();
  },
];

/**
 * Валидация для сообщений
 */
const validateMessage = [
  body('senderId')
    .isInt({ min: 1 })
    .toInt()
    .withMessage('senderId должен быть числом'),
  body('content')
    .notEmpty()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Текст обязателен и должен быть от 1 до 2000 символов'),
  body('receiverId')
    .isInt({ min: 1 })
    .toInt()
    .withMessage('receiverId должен быть числом'),
  body('isRead').isBoolean().withMessage('isRead должен быть true или false'),
  body('isEdited')
    .isBoolean()
    .withMessage('isEdited должен быть true или false'),
  body('deletedBySender')
    .isBoolean()
    .withMessage('deletedBySender должен быть true или false'),
  body('deletedByReceiver')
    .isBoolean()
    .withMessage('deletedByReceiver должен быть true или false'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Ошибка отправки сообщения',
        details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }
    next();
  },
];

/**
 * Валидация для музыки
 */
const validateMusic = [
  body('title')
    .notEmpty()
    .isString()
    .trim()
    .withMessage('Заголовок обязателен')
    .isLength({ min: 1, max: 100 })
    .withMessage('Заголовок до 100 символов'),
  body('artist')
    .notEmpty()
    .isString()
    .trim()
    .withMessage('Исполнитель обязателен')
    .isLength({ min: 1, max: 100 })
    .withMessage('Исполнитель до 100 символов'),
  body('album')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Альбом до 100 символов'),
  body('year')
    .optional({ nullable: true })
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .toInt(),
  body('duration')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 600 })
    .withMessage('Длительность должна быть от 1 до 600 секунд')
    .toInt(),
  body('audioUrl')
    .notEmpty()
    .isString()
    .trim()
    .withMessage('Аудио URL обязателен')
    .isLength({ min: 1, max: 500 })
    .withMessage('Аудио URL до 500 символов'),
  body('coverUrl')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Обложка URL до 500 символов'),
  body('category')
    .notEmpty()
    .isString()
    .trim()
    .withMessage('Категория обязательна')
    .isLength({ min: 1, max: 50 })
    .withMessage('Категория до 50 символов'),
  body('isPublic')
    .isBoolean()
    .withMessage('isPublic должен быть true или false'),
  body('description')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Описание до 2000 символов'),
  body('playsCount')
    .isInt({ min: 0 })
    .toInt()
    .withMessage('Количество проигрываний не может быть отрицательным числом'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Ошибка добавления трека',
        details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }
    next();
  },
];

/**
 * Валидация для видео
 */
const validateVideo = [
  body('title')
    .notEmpty()
    .isString()
    .trim()
    .withMessage('Заголовок обязателен')
    .isLength({ min: 1, max: 100 })
    .withMessage('Заголовок до 100 символов'),
  body('description')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Описание до 2000 символов'),
  body('duration')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 1800 })
    .toInt()
    .withMessage('Длительность должна быть от 1 до 1800 секунд'),
  body('size')
    .optional({ nullable: true })
    .isInt({ min: 1024 })
    .toInt()
    .withMessage('Размер должен быть числом'),
  body('year')
    .optional({ nullable: true })
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .toInt(),
  body('videoUrl')
    .notEmpty()
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Видео URL до 500 символов'),
  body('thumbnailUrl')
    .optional({ nullable: true })
    .isString()
    .isLength({ min: 1, max: 500 })
    .withMessage('Обложка до 500 символов'),
  body('previewUrl')
    .optional({ nullable: true })
    .isString()
    .isLength({ min: 1, max: 500 })
    .withMessage('Превью до 500 символов'),
  body('category')
    .notEmpty()
    .isString()
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
        error: 'Ошибка добавления видео',
        details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }
    next();
  },
];

/**
 * Валидация для новостей
 */
const validateNews = [
  body('title')
    .notEmpty()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Заголовок до 100 символов'),
  body('text')
    .notEmpty()
    .isString()
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Текст до 5000 символов'),
  body('date')
    .optional({ nullable: true })
    .isDate()
    .withMessage('Некорректная дата'),
  body('author')
    .notEmpty()
    .isString()
    .trim()
    .withMessage('Автор обязателен')
    .isLength({ min: 1, max: 100 })
    .withMessage('Автор до 100 символов'),
  body('category')
    .notEmpty()
    .isString()
    .trim()
    .withMessage('Категория обязательна')
    .isLength({ min: 1, max: 50 })
    .withMessage('Категория до 50 символов'),
  body('type')
    .notEmpty()
    .isIn(['text', 'image', 'video'])
    .withMessage('Тип должен быть text, image или video'),
  body('source')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Источник до 100 символов'),
  body('newsUrl')
    .optional({ nullable: true })
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Новость URL до 500 символов'),
  body('viewsCount')
    .isInt({ min: 0 })
    .toInt()
    .withMessage('Количество просмотров должно быть числом'),
  body('isEdited')
    .isBoolean()
    .withMessage('isEdited должен быть true или false'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Ошибка добавления новости',
        details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
      });
    }
    next();
  },
];

/**
 * Валидация ID в параметрах
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
