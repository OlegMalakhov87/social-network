import { useCallback, useEffect, useRef } from 'react';

import { getVideoStats } from '../../../entities/video';
import { EntityStats, IconButton, Modal, RichText } from '../../../shared/ui';
import { useAudioPlayer } from '../../audio-player';

import style from './VideoPlayer.module.css';

/**
 * Отображает модальный видеоплеер.
 *
 * @param {Object} props - Свойства компонента
 * @param {Object} props.video - Данные видео
 * @param {Function} props.onClose - Обработчик закрытия плеера
 * @param {Function} [props.onPlayStart] - Обработчик первого старта воспроизведения
 * @returns {JSX.Element} Разметка плеера.
 */
export const VideoPlayer = ({ video, onClose, onPlayStart }) => {
  const { pause, play, isPlaying } = useAudioPlayer();
  const shouldResumeAudioRef = useRef(isPlaying);
  const playStartedRef = useRef(false);
  const videoRef = useRef(null);

  // Ставит текущий трек на паузу и возобновляет его при закрытии плеера.
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

  // Сбрасывает отметку старта при смене видео.
  useEffect(() => {
    playStartedRef.current = false;
  }, [video?.id]);

  const handleVideoPlay = useCallback(() => {
    // Запасное видео не увеличивает счётчик просмотров.
    if (videoRef.current?.dataset.fallback === 'true') return;
    // Сообщает о старте один раз за ролик.
    if (playStartedRef.current || !video?.id) return;
    playStartedRef.current = true;
    onPlayStart?.(video);
  }, [video, onPlayStart]);

  const handleVideoError = useCallback(() => {
    const player = videoRef.current;

    if (!player) return;

    // Повторно не переключает источник: запасное видео тоже недоступно.
    if (player.dataset.fallback === 'true') {
      console.error('[VideoPlayer] Резервное видео недоступно');
      return;
    }

    console.warn('[VideoPlayer] Основное видео недоступно');

    player.dataset.fallback = 'true';
    player.src = '/socialnet-video-unavailable-5s.mp4';
    player.load();

    // Браузер может заблокировать автоматический запуск.
    player.play().catch(() => {
      console.warn('[VideoPlayer] Не удалось автоматически запустить fallback');
    });
  }, []);

  const videoUrl = video?.videoUrl || video?.postUrl || video?.newsUrl;

  if (!videoUrl) {
    return (
      <Modal
        isOpen={true}
        onClose={onClose}
        title="Видео недоступно"
        mobileFullscreen={false}
      >
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
      mobileFullscreen={false}
      contentClassName={style.modalContent}
    >
      <div className={style.player}>
        <video
          key={`${video?.id}-${videoUrl}`}
          ref={videoRef}
          src={videoUrl}
          controls
          autoPlay
          onPlay={handleVideoPlay}
          onError={handleVideoError}
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
