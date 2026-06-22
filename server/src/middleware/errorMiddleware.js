const errorMiddleware = (err, req, res, next) => {
  console.error('Error:', err);

  // Sequelize ошибки валидации
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    return res.status(400).json({ 
      error: 'Ошибка валидации',
      details: errors 
    });
  }

  // Sequelize ошибки уникальности
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'поле';
    return res.status(400).json({ 
      error: `Запись с таким ${field} уже существует` 
    });
  }

  // Sequelize ошибки внешнего ключа
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({ 
      error: 'Связанная запись не найдена' 
    });
  }

  // Ошибки JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Недействительный токен' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Токен истек' });
  }

  // Ошибки multer
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }

  // По умолчанию
  res.status(500).json({ 
    error: 'Внутренняя ошибка сервера',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

module.exports = errorMiddleware;