import { useCallback, useEffect, useRef } from 'react';
import { getVideoStats } from '../../../entities/video';
import { EntityStats, IconButton, Modal, Text } from '../../../shared/ui';
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
  const wasAudioPlaying = useRef(false);
  const playStartedRef = useRef(false);
  const videoRef = useRef(null);

  useEffect(() => {
    wasAudioPlaying.current = isPlaying;
    if (isPlaying) pause?.();

    return () => {
      if (wasAudioPlaying.current) play?.();
    };
  }, [pause, play, isPlaying]);

  useEffect(() => {
    playStartedRef.current = false;
  }, [video?.id]);

  const handleVideoPlay = useCallback(() => {
    if (playStartedRef.current || !video?.id) return;
    playStartedRef.current = true;
    onPlayStart?.(video);
  }, [video, onPlayStart]);

  const videoUrl = video?.videoUrl || video?.postUrl || video?.newsUrl;

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
    <Modal isOpen={true} onClose={onClose} title={video.title} size="lg">
      <div className={style.player}>
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          autoPlay
          onPlay={handleVideoPlay}
          aria-label={video.title}
        />
      </div>

      <section>
        <EntityStats items={statsItems} />

        <Text>{video.description || 'Описание отсутствует'}</Text>
      </section>
    </Modal>
  );
};
