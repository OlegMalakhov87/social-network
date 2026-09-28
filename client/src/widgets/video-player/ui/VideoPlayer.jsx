import { useCallback, useEffect, useRef } from 'react';
import { getVideoStats } from '../../../entities/video';
import { EntityStats, IconButton, Modal, RichText } from '../../../shared/ui';
import { useAudioPlayer } from '../../audio-player';
import style from './VideoPlayer.module.css';

/**
 * Модальный видеоплеер.
 *
 * @param {Object} props
 * @param {Object} props.video - данные видео
 * @param {Function} props.onClose - колбэк закрытия
 * @param {Function} [props.onPlayStart] - один раз при начале воспроизведения
 */
export const VideoPlayer = ({ video, onClose, onPlayStart }) => {
  const { pause, play, isPlaying } = useAudioPlayer();
  const shouldResumeAudioRef = useRef(isPlaying);
  const playStartedRef = useRef(false);
  const videoRef = useRef(null);

  /** Пауза трека при открытии видео + возобновление только при закрытии модалки. */
  useEffect(() => {
    const shouldResumeAudio = shouldResumeAudioRef.current;

    if (shouldResumeAudio) {
      pause?.();
    }

    return () => {
      if (shouldResumeAudio) {
        play?.();
      }
    };
  }, [pause, play]);

  /** Обработчик начала воспроизведения видео */
  useEffect(() => {
    playStartedRef.current = false;
  }, [video?.id]);

  /** Обработчик воспроизведения видео */
  const handleVideoPlay = useCallback(() => {
    if (playStartedRef.current || !video?.id) return;
    playStartedRef.current = true;
    onPlayStart?.(video);
  }, [video, onPlayStart]);

  /** URL видео */
  const videoUrl = video?.videoUrl || video?.postUrl || video?.newsUrl;

  /** Если видео не найдено, отображается модальное окно с сообщением о недоступности видео */
  if (!videoUrl) {
    return (
      <Modal isOpen={true} onClose={onClose} title="Видео недоступно">
        <div className={style.empty}>
          <p>Видео недоступно</p>
          <IconButton
            icon="✕"
            variant="ghost"
            size="md"
            onClick={onClose}
            ariaLabel="Закрыть"
          />
        </div>
      </Modal>
    );
  }

  const statsItems = getVideoStats(video);

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={video.title}
      size="lg"
      contentClassName={style.modalContent}
    >
      <div className={style.player}>
        <video
          ref={videoRef}
          src={videoUrl || '/video.mp4'}
          controls
          autoPlay
          onPlay={handleVideoPlay}
          aria-label={video.title}
        />
      </div>

      <section className={style.meta}>
        <EntityStats items={statsItems} />

        <RichText
          text={video.description}
          variant="body1"
          className={style.description}
          emptyText="Описание отсутствует"
        />
      </section>
    </Modal>
  );
};
