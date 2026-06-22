const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../../db/models');

const generateToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'default_secret_change_later', {
    expiresIn: '7d',
  });
};

const authController = {
  // Получение пользователя из токена
  getMe: async (req, res) => {
    const user = req.user.toJSON();
    delete user.passwordHash;
    res.json({ user });
  },
  // Регистрация
  register: async (req, res) => {
    try {
      const { name, email, password, nickname, age } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Имя, email и пароль обязательны' });
      }

      // Проверяем, нет ли уже такого пользователя
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ error: 'Email уже используется' });
      }

      // Хешируем пароль
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = await User.create({
        name,
        email,
        passwordHash,
        nickname: nickname || null,
        age: age || null,
      });

      const token = generateToken(user);

      // Возвращаем всё, кроме хеша пароля
      const userResponse = user.toJSON();
      delete userResponse.passwordHash;

      res.status(201).json({ user: userResponse, token });
    } catch (error) {
      console.error('Register error:', error);
      if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map((err) => err.message).join(', ');
        return res.status(400).json({ error: errors });
      }
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // Логин
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email и пароль обязательны' });
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Неверный email или пароль' });
      }

      //Сравниваем пароль
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Неверный email или пароль' });
      }

      const token = generateToken(user);
      const userResponse = user.toJSON();
      delete userResponse.passwordHash;

      res.json({ user: userResponse, token });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },
};

module.exports = authController;
