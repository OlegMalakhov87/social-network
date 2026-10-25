const path = require('node:path');
const os = require('node:os');

/** Задает корневой каталог пользовательских медиафайлов. */
const MEDIA_ROOT = path.resolve(__dirname, '../uploads');

/**
 * Задает корневой каталог временных медиафайлов.
 *
 * Использует MEDIA_STAGING_DIR или системный временный каталог как запасное значение.
 */
const STAGING_ROOT = path.resolve(
  process.env.MEDIA_STAGING_DIR ||
    path.join(os.tmpdir(), 'socialnet-media-staging')
);

/**
 * Задает скрытый каталог атомарной публикации рядом с MEDIA_ROOT.
 *
 * Файлы сначала копируются сюда и только затем перемещаются в MEDIA_ROOT.
 */
const PUBLISH_STAGING_ROOT = path.resolve(
  path.dirname(MEDIA_ROOT),
  '.media-publish-staging'
);

/**
 * Проверяет, что путь находится внутри корневого каталога.
 *
 * @param {string} root - Абсолютный путь корневого каталога
 * @param {string} target - Проверяемый абсолютный путь
 * @returns {boolean} Признак того, что путь не выходит за корень.
 */
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

/** Задает каталоги загрузки медиафайлов. */
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

/** Задает допустимые MIME-типы загружаемых медиафайлов. */
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
