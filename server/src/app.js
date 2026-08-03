const express = require('express');
const app = express();
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');

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

const errorMiddleware = require('./middleware/errorMiddleware');

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000', // только с этого домена
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // разрешенные методы
    credentials: true, // разрешить куки/авторизацию
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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

app.use(errorMiddleware);

module.exports = app;
