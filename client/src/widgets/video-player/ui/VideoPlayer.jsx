import { useEffect, useRef } from 'react';

import style from './VideoPlayer.module.css';

import { Modal } from '../../../shared/ui';
import { useAudioPlayer } from '../../audio-player';

import { formatFileSize, formatViews } from '../../../shared/lib';

/**
 * Модальный видеоплеер.
 *
 * При открытии ставит аудиоплеер на паузу,
 * при закрытии восстанавливает воспроизведение.
 *
 * @param {Object} props
 * @param {Object} props.video
 * @param {Function} props.onClose
 */
export const VideoPlayer = ({ video, onClose }) => {
  const { pause, play, isPlaying } = useAudioPlayer();

  const wasAudioPlaying = useRef(false);

  useEffect(() => {
    wasAudioPlaying.current = isPlaying;

    if (isPlaying) {
      pause();
    }

    return () => {
      if (wasAudioPlaying.current) {
        play();
      }
    };
  }, [pause, play, isPlaying]);

  const videoUrl = video.videoUrl || video.mediaUrl;

  return (
    <Modal onClose={onClose}>
      {!videoUrl ? (
        <div className={style.empty}>
          <p>Видео недоступно</p>

          <button className={style.closeButton} onClick={onClose}>
            Закрыть
          </button>
        </div>
      ) : (
        <>
          <header className={style.header}>
            <h2 className={style.title}>{video.title}</h2>

            <button
              className={style.iconButton}
              onClick={onClose}
              aria-label="Закрыть"
            >
              ✕
            </button>
          </header>

          <div className={style.player}>
            <video src={videoUrl} controls autoPlay />
          </div>

          <section className={style.description}>
            <div className={style.meta}>
              <div className={style.stats}>
                {!!video.size && (
                  <span className={style.chip}>
                    📁 {formatFileSize(video.size)}
                  </span>
                )}

                <span className={style.chip}>
                  👁 {formatViews(video.viewCount ?? 0)}
                </span>

                <span className={style.chip}>
                  📅{' '}
                  {new Date(video.date || video.createdAt).toLocaleDateString(
                    'ru-RU'
                  )}
                </span>

                <span className={style.chip}>
                  💬 {video.commentsCount ?? 0}
                </span>

                <span className={style.chip}>
                  {video.isLiked ? '❤️' : '🤍'} {video.likesCount ?? 0}
                </span>
              </div>
            </div>

            <div className={style.text}>
              {video.description || video.message || 'Описание отсутствует'}
            </div>
          </section>
        </>
      )}
    </Modal>
  );
};
