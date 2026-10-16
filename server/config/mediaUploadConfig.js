const path = require('node:path');
const os = require('node:os');

/** Корневая директория с пользовательскими медиафайлами */
const MEDIA_ROOT = path.resolve(__dirname, '../uploads');

/**
 * Корневая папка для временных (staging) медиафайлов.
 * Берётся из MEDIA_STAGING_DIR или используется системный tmpdir.
 */
const STAGING_ROOT = path.resolve(
  process.env.MEDIA_STAGING_DIR ||
    path.join(os.tmpdir(), 'socialnet-media-staging')
);

/**
 * Промежуточная папка для атомарной публикации:
 * сюда файлы копируются, отсюда — перемещаются в MEDIA_ROOT.
 * Расположена рядом с MEDIA_ROOT, но скрыта (начинается с точки).
 */
const PUBLISH_STAGING_ROOT = path.resolve(
  path.dirname(MEDIA_ROOT),
  '.media-publish-staging'
);

/** Проверка, что target находится внутри root */
const isWithin = (root, target) => {
  const relative = path.relative(root, target);

  return (
    relative === '' ||
    (relative !== '..' &&
      !relative.startsWith(`..${path.sep}`) &&
      !path.isAbsolute(relative))
  );
};

const pairs = [
  [MEDIA_ROOT, STAGING_ROOT],
  [MEDIA_ROOT, PUBLISH_STAGING_ROOT],
  [STAGING_ROOT, MEDIA_ROOT],
  [PUBLISH_STAGING_ROOT, MEDIA_ROOT],
  [STAGING_ROOT, PUBLISH_STAGING_ROOT],
  [PUBLISH_STAGING_ROOT, STAGING_ROOT],
];

const conflict = pairs.find(([root, target]) => isWithin(root, target));

if (conflict) {
  throw new Error(
    `[MediaConfig] Директории медиа и staging не должны пересекаться: ` +
      `${conflict[0]} внутри ${conflict[1]}`
  );
}

/** Конфигурация путей для загрузки медиа файлов */
const UPLOAD_DESTINATIONS = {
  avatarUrl: 'avatars',
  thumbnailUrl: 'videos/thumbnails',
  coverUrl: 'music/covers',
  postUrl: {
    image: 'posts/images',
    video: 'posts/videos',
  },
  newsUrl: {
    image: 'news/images',
    video: 'news/videos',
  },
  videoUrl: 'videos/video',
  previewUrl: 'videos/previews',
  audioUrl: 'music/tracks',
};

/** Конфигурация MIME типов для загрузки медиа файлов */
const UPLOAD_MIME_CONFIG = {
  avatarUrl: ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'],

  thumbnailUrl: ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'],

  coverUrl: ['image/jpg', 'image/jpeg', 'image/png', 'image/webp'],

  postUrl: [
    'image/jpg',
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime',
  ],

  newsUrl: [
    'image/jpg',
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime',
  ],

  videoUrl: ['video/mp4', 'video/webm', 'video/quicktime'],

  previewUrl: ['video/mp4', 'video/webm', 'video/quicktime'],

  audioUrl: ['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/flac'],
};

module.exports = {
  UPLOAD_MIME_CONFIG,
  UPLOAD_DESTINATIONS,
  STAGING_ROOT,
  MEDIA_ROOT,
  PUBLISH_STAGING_ROOT,
};
