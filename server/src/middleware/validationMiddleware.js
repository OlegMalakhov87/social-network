const { body, param, query, validationResult } = require('express-validator');

// Валидация для пользователей
const validateUser = [
  body('email').isEmail().normalizeEmail(),
  body('password').optional().isLength({ min: 6 }),
  body('name').optional().trim().escape(),
  body('age').optional().isInt({ min: 9, max: 99 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Валидация для постов
const validatePost = [
  body('message').notEmpty().trim().isLength({ min: 1, max: 2000 }),
  body('visibility').optional().isIn(['public', 'friends', 'private']),
  body('postType').optional().isIn(['text', 'image', 'video']),
  body('mediaUrl').optional().isURL(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Валидация для комментариев
const validateComment = [
  body('content').notEmpty().trim().isLength({ min: 1, max: 1000 }),
  body('targetType').isIn(['Post', 'Music', 'Video', 'News']),
  body('targetId').isInt({ min: 1 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Валидация для лайков
const validateLike = [
  body('targetType').isIn(['Post', 'Music', 'Video', 'News', 'Comment']),
  body('targetId').isInt({ min: 1 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Валидация для сообщений
const validateMessage = [
  body('message').notEmpty().trim().isLength({ min: 1, max: 1000 }),
  body('receiverId').isInt({ min: 1 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Валидация для музыки/видео
const validateMedia = [
  body('title').notEmpty().trim().isLength({ min: 1, max: 100 }),
  body('artist').optional().trim(),
  body('fileUrl').isURL(),
  body('isPublic').optional().isBoolean(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Валидация ID в параметрах
const validateIdParam = (paramName) => [
  param(paramName).isInt({ min: 1 }).toInt(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: `Неверный формат ${paramName}` });
    }
    next();
  },
];

module.exports = {
  validateUser,
  validatePost,
  validateComment,
  validateLike,
  validateMessage,
  validateMedia,
  validateIdParam,
};
