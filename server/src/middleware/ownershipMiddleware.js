const { Post, Comment, Message, Like, Music, Video } = require('../../db/models');

// Проверка владельца поста
const checkPostOwnership = async (req, res, next) => {
  try {
    const postId = req.params.postId || req.params.id;
    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ error: 'Пост не найден' });
    }

    if (post.userId !== parseInt(userId)) {
      return res.status(403).json({ error: 'Нет прав для этого действия' });
    }

    req.resource = post;
    next();
  } catch (error) {
    console.error('Ownership check error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Проверка владельца музыки

const checkMusicOwnership = async (req, res, next) => {
  try {
    const trackId = req.params.trackId || req.params.id;
    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }

    const track = await Music.findByPk(trackId);
    if (!track) {
      return res.status(404).json({ error: 'Трек не найден' });
    }

    if (track.uploadedBy !== parseInt(userId)) {
      return res.status(403).json({ error: 'Нет прав для этого действия' });
    }

    req.resource = track;
    next();
  } catch (error) {
    console.error('Ownership check error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Проверка владельца видео
const checkVideoOwnership = async (req, res, next) => {
  try {
    const videoId = req.params.videoId || req.params.id;
    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }

    const video = await Video.findByPk(videoId);
    if (!video) {
      return res.status(404).json({ error: 'Видео не найдено' });
    }

    if (video.uploadedBy !== parseInt(userId)) {
      return res.status(403).json({ error: 'Нет прав для этого действия' });
    }

    req.resource = video;
    next();
  } catch (error) {
    console.error('Ownership check error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Проверка владельца комментария
const checkCommentOwnership = async (req, res, next) => {
  try {
    const commentId = req.params.commentId || req.params.id;
    const userId = req.user?.id || req.body.userId;

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Комментарий не найден' });
    }

    if (comment.userId !== parseInt(userId)) {
      return res.status(403).json({ error: 'Нет прав для этого действия' });
    }

    req.resource = comment;
    next();
  } catch (error) {
    console.error('Ownership check error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

//Проверка владельца лайка
const checkLikeOwnership = async (req, res, next) => {
  try {
    const likeId = req.params.likeId || req.params.id;
    const userId = req.user?.id || req.body.userId;

    const like = await Like.findByPk(likeId);
    if (!like) {
      return res.status(404).json({ error: 'Лайк не найден' });
    }

    if (like.userId !== parseInt(userId)) {
      return res.status(403).json({ error: 'Нет прав для этого действия' });
    }

    req.resource = like;
    next();
  } catch (error) {
    console.error('Ownership check error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// Проверка владельца сообщения
const checkMessageOwnership = async (req, res, next) => {
  try {
    const messageId = req.params.messageId || req.params.id;
    const userId = req.user?.id || req.body.userId;

    const message = await Message.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Сообщение не найдено' });
    }

    // Сообщение может редактировать только отправитель
    if (message.senderId !== parseInt(userId)) {
      return res.status(403).json({ error: 'Нет прав для этого действия' });
    }

    req.resource = message;
    next();
  } catch (error) {
    console.error('Ownership check error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

module.exports = {
  checkPostOwnership,
  checkCommentOwnership,
  checkMessageOwnership,
  checkLikeOwnership,
  checkMusicOwnership,
  checkVideoOwnership,
};
