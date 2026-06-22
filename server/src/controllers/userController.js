const { User } = require('../../db/models');
const { Op } = require('sequelize');
const { clients } = require('../websocket');
const bcrypt = require('bcryptjs');

const userController = {
  // ==================== GET запросы ====================

  // 1. Поиск пользователя
  searchUsers: async (req, res) => {
    try {
      const { q, page = 1, limit = 30 } = req.query;

      if (!q || q.trim().length < 2) {
        return res.status(400).json({ error: 'Минимум 2 символа' });
      }

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const searchTerm = `%${q}%`;

      const { count, rows: users } = await User.findAndCountAll({
        where: {
          [Op.or]: [
            { name: { [Op.iLike]: searchTerm } },
            { nickname: { [Op.iLike]: searchTerm } },
            { email: { [Op.iLike]: searchTerm } },
          ],
        },
        attributes: { exclude: ['passwordHash'] },
        limit: parseInt(limit),
        offset,
      });

      res.json({
        users,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / parseInt(limit)),
        },
      });
    } catch (error) {
      console.error('GET /profile/search error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // 2. Все пользователи (с пагинацией)
  getAllUsers: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 30;
      const offset = (page - 1) * limit;

      const { count, rows: users } = await User.findAndCountAll({
        attributes: { exclude: ['passwordHash'] },
        limit,
        offset,
        order: [['createdAt', 'DESC']],
      });

      res.json({
        users,
        pagination: {
          totalUsers: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
          hasMore: page * limit < count,
        },
      });
    } catch (error) {
      console.error('GET /profile/ error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // 3. Получить пользователя по ID
  getUserById: async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findByPk(userId, {
        attributes: { exclude: ['passwordHash'] },
      });

      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      res.json(user);
    } catch (error) {
      console.error('GET /:userId error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // 4. Получение статуса пользователей в сети по ID
  checkOnlineBulk: async (req, res) => {
    const { userIds } = req.body;
    if (!Array.isArray(userIds)) return res.status(400).json({ error: 'Массив обязателен' });
    const result = userIds.map((id) => ({ userId: id, online: clients.has(id) }));
    res.json({ users: result });
  },

  // ==================== POST запросы ====================

  // 5. Создать пользователя
  createUser: async (req, res) => {
    try {
      const { name, age, email, passwordHash } = req.body;

      if (!email || !passwordHash) {
        return res.status(400).json({
          error: 'Email и пароль обязательны',
        });
      }

      const user = await User.create({
        email,
        passwordHash,
        name,
        age,
      });

      // Не возвращаем пароль
      const userResponse = {
        id: user.id,
        email: user.email,
        name: user.name,
        age: user.age,
        createdAt: user.createdAt,
      };

      res.status(201).json(userResponse);
    } catch (error) {
      console.error('POST /profile error:', error);

      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ error: 'Email уже используется' });
      }

      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // ==================== PUT запросы ====================

  // 7. Обновить пользователя
  updateUser: async (req, res) => {
    try {
      const userId = req.user.id; // берем из токена
      const { ...updates } = req.body;

      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'Нет данных для обновления' });
      }

      await user.update(updates);

      const updatedUser = await User.findByPk(userId, {
        attributes: { exclude: ['passwordHash'] },
      });

      res.json(updatedUser);
    } catch (error) {
      console.error('PUT /profile/:userId error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  // ==================== DELETE запросы ====================

  // 8. Удалить пользователя
  deleteUser: async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      await user.destroy();

      res.json({
        success: true,
        message: 'Пользователь удален',
        userId: userId,
      });
    } catch (error) {
      console.error('DELETE /profile/:userId error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },

  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findByPk(req.user.id);

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Текущий и новый пароль обязательны' });
      }

      //Сравниваем пароль
      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Неверный текущий пароль' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(newPassword, salt);
      await user.update({ passwordHash });

      res.json({ success: true });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Ошибка сервера' });
    }
  },
};

module.exports = userController;
