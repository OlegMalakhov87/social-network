const path = require('node:path');
const { Video, Post, News, Music, User } = require('../db/models');

/** Конфигурация очистки медиафайлов */
const MEDIA_CLEANUP_CONFIG = {
  entities: [
    {
      model: User,
      fields: ['avatarUrl'],
    },
    {
      model: Video,
      fields: ['videoUrl', 'previewUrl', 'thumbnailUrl'],
    },
    {
      model: Post,
      fields: ['postUrl', 'previewUrl', 'thumbnailUrl'],
    },
    {
      model: News,
      fields: ['newsUrl', 'previewUrl', 'thumbnailUrl'],
    },
    {
      model: Music,
      fields: ['audioUrl', 'coverUrl'],
    },
  ],
};

module.exports = { MEDIA_CLEANUP_CONFIG };
