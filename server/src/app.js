const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const { MEDIA_ROOT } = require('../config/mediaUploadConfig');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const postRoutes = require('./routes/postRoutes');
const friendRoutes = require('./routes/friendRoutes');
const musicRoutes = require('./routes/musicRoutes');
const userMusicLibraryRoutes = require('./routes/userMusicLibraryRoutes');
const videoRoutes = require('./routes/videoRoutes');
const userVideoLibraryRoutes = require('./routes/userVideoLibraryRoutes');
const newsRoutes = require('./routes/newsRoutes');
const likeRoutes = require('./routes/likeRoutes');
const commentRoutes = require('./routes/commentRoutes');
const widgetRoutes = require('./routes/widgetRoutes');
const errorMiddleware = require('./middleware/error/errorMiddleware');

const app = express();

// Кросс-доменные запросы
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000', // Разрешает запросы только с адреса клиента.
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true, // Разрешает передачу cookie и авторизации.
  })
);

// Разбор JSON
app.use(express.json());

// Разбор cookie
app.use(cookieParser());

// Разбор URL-encoded
app.use(express.urlencoded({ extended: true }));

// Журнал запросов HTTP
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Статические файлы
app.use(
  '/uploads',
  express.static(MEDIA_ROOT, {
    maxAge: '1d',
    etag: true,
    lastModified: true,
  })
);

// Маршруты
app.use('/api/auth', authRoutes);
app.use('/api/profile', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/usermusiclibrary', userMusicLibraryRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/uservideolibrary', userVideoLibraryRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/widgets', widgetRoutes);

// Промежуточный обработчик ошибок
app.use(errorMiddleware);

module.exports = app;
