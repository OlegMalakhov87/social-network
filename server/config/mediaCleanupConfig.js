const path = require('path');
const { Video, Post, News, Music } = require('../db/models');

/**
 * Корневая директория с пользовательскими медиафайлами.
 */
const MEDIA_ROOT = path.resolve(__dirname, '../uploads');

/**
 * Конфигурация очистки медиафайлов.
 */
const MEDIA_CLEANUP_CONFIG = {
  root: MEDIA_ROOT,

  entities: [
    {
      model: Video,
      fields: ['videoUrl', 'previewUrl', 'thumbnailUrl'],
    },
    {
      model: Post,
      fields: ['postUrl'],
    },
    {
      model: News,
      fields: ['newsUrl'],
    },
    {
      model: Music,
      fields: ['audioUrl', 'coverUrl'],
    },
  ],
};

module.exports = MEDIA_CLEANUP_CONFIG;
