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
  accept: 'image/jpeg,image/png,image/webp',
  validators: composeValidators([
    maxFileSize(5 * 1024 * 1024, 'Аватар не должен превышать 5MB'),
    fileType(
      ['image/jpeg', 'image/png', 'image/webp'],
      'Поддерживаются только JPG, PNG, WEBP'
    ),
    fileExtension(['.jpg', '.jpeg', '.png', '.webp']),
    minImageResolution(200, 200, 'Минимальное разрешение аватара: 200x200px'),
    aspectRatio(1, 0.1, 'Аватар должен быть квадратным'),
  ]),
  endpoint: '/profile/upload-avatar',
  fieldName: 'avatar',
  previewType: 'image',
};

/**
 * Конфигурация загрузки обложки альбома (трека).
 */
export const ALBUM_COVER_CONFIG = {
  accept: 'image/jpeg,image/png,image/webp',
  validators: composeValidators([
    maxFileSize(5 * 1024 * 1024, 'Обложка не должна превышать 5MB'),
    fileType(
      ['image/jpeg', 'image/png', 'image/webp'],
      'Поддерживаются только JPG, PNG, WEBP'
    ),
    fileExtension(['.jpg', '.jpeg', '.png', '.webp']),
    minImageResolution(300, 300, 'Минимальное разрешение обложки: 300x300px'),
    aspectRatio(1, 0.1, 'Обложка должна быть квадратной'),
  ]),
  endpoint: '/music/upload-cover',
  fieldName: 'cover',
  previewType: 'image',
};

/**
 * Конфигурация загрузки превью (обложки) видео.
 */
export const VIDEO_THUMBNAIL_CONFIG = {
  accept: 'image/jpeg,image/png,image/webp',
  validators: composeValidators([
    maxFileSize(5 * 1024 * 1024, 'Превью не должно превышать 5MB'),
    fileType(
      ['image/jpeg', 'image/png', 'image/webp'],
      'Поддерживаются только JPG, PNG, WEBP'
    ),
    fileExtension(['.jpg', '.jpeg', '.png', '.webp']),
    minImageResolution(640, 360, 'Минимальное разрешение превью: 640x360px'),
    aspectRatio(16 / 9, 0.15, 'Превью должно быть в формате 16:9'),
  ]),
  endpoint: '/videos/upload-thumbnail',
  fieldName: 'thumbnail',
  previewType: 'image',
};

/**
 * Конфигурация загрузки изображения для поста.
 */
export const POST_IMAGE_UPLOAD_CONFIG = {
  accept: 'image/jpeg,image/png,image/webp,image/gif',
  validators: composeValidators([
    maxFileSize(10 * 1024 * 1024, 'Изображение не должно превышать 10MB'),
    fileType(['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    fileExtension(['.jpg', '.jpeg', '.png', '.webp', '.gif']),
  ]),
  endpoint: '/posts/upload-media',
  fieldName: 'media',
  previewType: 'image',
};

/**
 * Конфигурация загрузки видео для поста.
 */
export const POST_VIDEO_UPLOAD_CONFIG = {
  accept: 'video/mp4,video/webm,video/quicktime',
  validators: composeValidators([
    maxFileSize(200 * 1024 * 1024, 'Видео не должно превышать 200MB'),
    fileType(
      ['video/mp4', 'video/webm', 'video/quicktime'],
      'Поддерживаются только MP4, WebM, MOV'
    ),
    fileExtension(['.mp4', '.webm', '.mov']),
    maxDuration(300, 'Длительность видео не должна превышать 5 минут'),
  ]),
  endpoint: '/posts/upload-media',
  fieldName: 'media',
  previewType: 'video',
};

/**
 * Конфигурация загрузки изображения для новости.
 */
export const NEWS_IMAGE_UPLOAD_CONFIG = {
  accept: 'image/jpeg,image/png,image/webp',
  validators: composeValidators([
    maxFileSize(10 * 1024 * 1024, 'Изображение не должно превышать 10MB'),
    fileType(
      ['image/jpeg', 'image/png', 'image/webp'],
      'Поддерживаются только JPG, PNG, WEBP'
    ),
    fileExtension(['.jpg', '.jpeg', '.png', '.webp']),
  ]),
  endpoint: '/news/upload-media',
  fieldName: 'media',
  previewType: 'image',
};

/**
 * Конфигурация загрузки видео для новости.
 */
export const NEWS_VIDEO_UPLOAD_CONFIG = {
  accept: 'video/mp4,video/webm,video/quicktime',
  validators: composeValidators([
    maxFileSize(100 * 1024 * 1024, 'Видео не должно превышать 100MB'),
    fileType(
      ['video/mp4', 'video/webm', 'video/quicktime'],
      'Поддерживаются только MP4, WebM, MOV'
    ),
    fileExtension(['.mp4', '.webm', '.mov']),
    maxDuration(300, 'Длительность видео не должна превышать 5 минут'),
  ]),
  endpoint: '/news/upload-media',
  fieldName: 'media',
  previewType: 'video',
};

/**
 * Конфигурация загрузки видео.
 */
export const VIDEO_UPLOAD_CONFIG = {
  accept: 'video/mp4,video/webm,video/quicktime',
  validators: composeValidators([
    maxFileSize(100 * 1024 * 1024, 'Видео не должно превышать 100MB'),
    fileType(
      ['video/mp4', 'video/webm', 'video/quicktime'],
      'Поддерживаются только MP4, WebM, MOV'
    ),
    fileExtension(['.mp4', '.webm', '.mov']),
    maxDuration(300, 'Длительность видео не должна превышать 5 минут'),
  ]),
  endpoint: '/videos/upload-video',
  fieldName: 'video',
  previewType: 'video',
};

/**
 * Конфигурация загрузки аудиотрека.
 */
export const TRACK_UPLOAD_CONFIG = {
  accept: 'audio/mpeg,audio/wav,audio/ogg,audio/flac',
  validators: composeValidators([
    maxFileSize(10 * 1024 * 1024, 'Трек не должен превышать 10MB'),
    fileType(
      ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac'],
      'Поддерживаются только MP3, WAV, OGG, FLAC'
    ),
    fileExtension(['.mp3', '.wav', '.ogg', '.flac']),
    maxDuration(600, 'Длительность трека не должна превышать 10 минут'),
  ]),
  endpoint: '/tracks/upload-audio',
  fieldName: 'audio',
  previewType: 'audio',
};
