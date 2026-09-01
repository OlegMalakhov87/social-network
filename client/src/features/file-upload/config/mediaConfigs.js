import {
  composeValidators,
  fileExtension,
  fileType,
  maxFileSize,
} from '../../../shared/lib/fileValidators';
import {
  aspectRatio,
  maxDuration,
  minImageResolution,
} from '../../../shared/lib/mediaValidators';

/**
 * Конфигурация загрузки аватара профиля.
 */
export const AVATAR_UPLOAD_CONFIG = {
  accept: 'image/jpeg,image/png,image/webp,image/jpg',
  validators: composeValidators([
    maxFileSize(10 * 1024 * 1024, 'Аватар не должен превышать 10MB'),
    fileType(
      ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
      'Поддерживаются только JPEG, PNG, WEBP, JPG'
    ),
    fileExtension(['.jpg', '.jpeg', '.png', '.webp']),
    minImageResolution(200, 200, 'Минимальное разрешение аватара: 200x200px'),
  ]),
  endpoint: '/profile/upload-avatar',
  fieldName: 'avatarUrl',
  previewType: 'image',
};

/**
 * Конфигурация загрузки изображения для поста.
 */
export const POST_IMAGE_UPLOAD_CONFIG = {
  accept: 'image/jpeg,image/png,image/webp,image/gif,image/jpg',
  validators: composeValidators([
    maxFileSize(10 * 1024 * 1024, 'Изображение не должно превышать 10MB'),
    fileType([
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/jpg',
    ]),
    fileExtension(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.jpg']),
    minImageResolution(
      200,
      200,
      'Минимальное разрешение изображения: 200x200px'
    ),
  ]),
  endpoint: '/posts/upload-media',
  fieldName: 'postUrl',
  previewType: 'image',
};

/**
 * Конфигурация загрузки видео для поста.
 */
export const POST_VIDEO_UPLOAD_CONFIG = {
  accept: 'video/mp4,video/webm,video/quicktime, video/ogg',
  validators: composeValidators([
    maxFileSize(100 * 1024 * 1024, 'Видео не должно превышать 100 MB'),
    fileType(
      ['video/mp4', 'video/webm', 'video/quicktime'],
      'Поддерживаются только MP4, WebM, MOV'
    ),
    fileExtension(['.mp4', '.webm', '.mov']),
    maxDuration(60, 'Длительность видео не должна превышать 1 минуты'),
  ]),
  endpoint: '/posts/upload-media',
  fieldName: 'postUrl',
  previewType: 'video',
};

/**
 * Конфигурация загрузки изображения для новости.
 */
export const NEWS_IMAGE_UPLOAD_CONFIG = {
  accept: 'image/jpeg,image/png,image/webp,image/jpg',
  validators: composeValidators([
    maxFileSize(10 * 1024 * 1024, 'Изображение не должно превышать 10MB'),
    fileType(
      ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
      'Поддерживаются только JPEG, PNG, WEBP, JPG'
    ),
    fileExtension(['.jpeg', '.png', '.webp', '.jpg']),
    minImageResolution(
      200,
      200,
      'Минимальное разрешение изображения: 200x200px'
    ),
  ]),
  endpoint: '/news/upload-media',
  fieldName: 'newsUrl',
  previewType: 'image',
};

/**
 * Конфигурация загрузки видео для новости.
 */
export const NEWS_VIDEO_UPLOAD_CONFIG = {
  accept: 'video/mp4,video/webm,video/quicktime, video/ogg',
  validators: composeValidators([
    maxFileSize(100 * 1024 * 1024, 'Видео не должно превышать 100 MB'),
    fileType(
      ['video/mp4', 'video/webm', 'video/quicktime'],
      'Поддерживаются только MP4, WebM, MOV'
    ),
    fileExtension(['.mp4', '.webm', '.mov']),
    maxDuration(60, 'Длительность видео не должна превышать 1 минуты'),
  ]),
  endpoint: '/news/upload-media',
  fieldName: 'newsUrl',
  previewType: 'video',
};

/**
 * Конфигурация загрузки превью (обложки) видео.
 */
export const VIDEO_THUMBNAIL_CONFIG = {
  accept: 'image/jpeg,image/png,image/webp,image/jpg',
  validators: composeValidators([
    maxFileSize(10 * 1024 * 1024, 'Превью не должно превышать 10MB'),
    fileType(
      ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
      'Поддерживаются только JPEG, PNG, WEBP, JPG'
    ),
    fileExtension(['.jpeg', '.png', '.webp', '.jpg']),
    minImageResolution(640, 360, 'Минимальное разрешение превью: 640x360px'),
    aspectRatio(16 / 9, 0.1, 'Превью должно быть в формате 16:9'),
  ]),
  endpoint: '/videos/upload-thumbnail',
  fieldName: 'thumbnailUrl',
  previewType: 'image',
};

/**
 * Конфигурация загрузки превью видео.
 */
export const VIDEO_PREVIEW_CONFIG = {
  accept: 'video/mp4,video/webm,video/quicktime',
  validators: composeValidators([
    maxFileSize(100 * 1024 * 1024, 'Preview не должен превышать 100 MB'),
    fileType(
      ['video/mp4', 'video/webm', 'video/quicktime'],
      'Поддерживаются только MP4, WebM, MOV'
    ),
    fileExtension(['.mp4', '.webm', '.mov']),
    maxDuration(6, 'Preview не должен быть длиннее 6 секунд'),
  ]),
  endpoint: '/videos/upload-preview',
  fieldName: 'previewUrl',
  previewType: 'video',
};

/**
 * Конфигурация загрузки видео.
 */
export const VIDEO_UPLOAD_CONFIG = {
  accept: 'video/mp4,video/webm,video/quicktime, video/ogg',
  validators: composeValidators([
    maxFileSize(200 * 1024 * 1024, 'Видео не должно превышать 200 MB'),
    fileType(
      ['video/mp4', 'video/webm', 'video/quicktime'],
      'Поддерживаются только MP4, WebM, MOV'
    ),
    fileExtension(['.mp4', '.webm', '.mov']),
    maxDuration(1800, 'Длительность видео не должна превышать 30 минут'),
  ]),
  endpoint: '/videos/upload-video',
  fieldName: 'videoUrl',
  previewType: 'video',
};

/**
 * Конфигурация загрузки обложки альбома (трека).
 */
export const ALBUM_COVER_CONFIG = {
  accept: 'image/jpeg,image/png,image/webp,image/jpg',
  validators: composeValidators([
    maxFileSize(10 * 1024 * 1024, 'Обложка не должна превышать 10MB'),
    fileType(
      ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
      'Поддерживаются только JPEG, PNG, WEBP, JPG'
    ),
    fileExtension(['.jpeg', '.png', '.webp', '.jpg']),
    minImageResolution(640, 360, 'Минимальное разрешение обложки: 640x360px'),
    aspectRatio(16 / 9, 0.1, 'Обложка должна быть в формате 16:9'),
  ]),
  endpoint: '/music/upload-cover',
  fieldName: 'coverUrl',
  previewType: 'image',
};

/**
 * Конфигурация загрузки аудиотрека.
 */
export const TRACK_UPLOAD_CONFIG = {
  accept: 'audio/mpeg,audio/wav,audio/ogg,audio/flac',
  validators: composeValidators([
    maxFileSize(50 * 1024 * 1024, 'Трек не должен превышать 50 MB'),
    fileType(
      ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac'],
      'Поддерживаются только MP3, WAV, OGG, FLAC'
    ),
    fileExtension(['.mp3', '.wav', '.ogg', '.flac']),
    maxDuration(600, 'Длительность трека не должна превышать 10 минут'),
  ]),
  endpoint: '/music/upload-audio',
  fieldName: 'audioUrl',
  previewType: 'audio',
};
