import { useRef, useEffect } from 'react';
import style from './VideoPlayer.module.css';
import { useAudioPlayer } from '../../audio-player';
import { formatFileSize, formatViews } from '../../../shared/lib';

/**
 * Модальный видеоплеер с нативным управлением.
 * При открытии ставит аудио на паузу, при закрытии – возобновляет.
 * @param {Object} props
 * @param {Object} props.video - объект видео
 * @param {Function} props.onClose - закрыть плеер
 */

export const VideoPlayer = ({ video, onClose }) => {
  const modalRef = useRef(null);
  const { pause: pauseAudio, play: playAudio, isPlaying } = useAudioPlayer();
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  useEffect(() => {
    if (isPlayingRef.current) pauseAudio();

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) onClose();
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
      if (isPlayingRef.current) playAudio();
    };
  }, [pauseAudio, playAudio, onClose]);

  const effectiveUrl = video.videoUrl || video.mediaUrl;
  if (!effectiveUrl) {
    return (
      <div className={style.videoModal}>
        <div className={style.modalContent} ref={modalRef}>
          <p>Видео недоступно</p>
          <button onClick={onClose}>Закрыть</button>
        </div>
      </div>
    );
  }

  return (
    <div className={style.videoModal}>
      <div className={style.modalContent} ref={modalRef}>
        <div className={style.modalHeader}>
          <h2 className={style.modalTitle}>{video.title}</h2>
          <button className={style.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>
        <div className={style.videoPlayer}>
          <video
            src={effectiveUrl}
            controls
            autoPlay
            style={{ width: '100%', maxHeight: '70vh', background: '#000' }}
          />
        </div>
        <div className={style.videoDescription}>
          <div className={style.descriptionMeta}>
            <div className={style.stats}>
              {video.size ? (
                <div className={style.statItem}>
                  <span className={style.statIcon}>📁</span>
                  <span className={style.statValue}>{formatFileSize(video.size)}</span>
                </div>
              ) : (
                ''
              )}
              {video.viewCount ? (
                <div className={style.statItem}>
                  <span className={style.statIcon}>👁️</span>
                  <span className={style.statValue}>
                    {formatViews(video.viewCount ?? 0)} просмотров
                  </span>
                </div>
              ) : null}

              <div className={style.statItem}>
                <span className={style.statIcon}>📅</span>
                <span className={style.statValue}>
                  {new Date(video.date || video.createdAt).toLocaleDateString('ru-RU')}
                </span>
              </div>
            </div>
            <span className={style.actionChip}>{video.commentsCount ?? 0} 💬 </span>
            <span className={style.actionChip}>
              {video.isLiked ? '❤️' : '🤍'} {video.likesCount ?? 0}
            </span>
          </div>
          <div className={style.descriptionText}>
            {video.description || video.message ? (
              <p>{video.description || video.message}</p>
            ) : (
              'Описание отсутствует'
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
