import { useEffect, useRef } from 'react';
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
 */
export const VideoPlayer = ({ video, onClose }) => {
  const { pause, play, isPlaying } = useAudioPlayer();
  const wasAudioPlaying = useRef(false);

  useEffect(() => {
    wasAudioPlaying.current = isPlaying;
    if (isPlaying) pause?.();

    return () => {
      if (wasAudioPlaying.current) play?.();
    };
  }, [pause, play, isPlaying]);

  const videoUrl = video?.videoUrl || video?.mediaUrl;

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
        <video src={videoUrl} controls autoPlay aria-label={video.title} />
      </div>

      <section >
        <EntityStats items={statsItems} />

        <Text >
          {video.description || video.message || 'Описание отсутствует'}
        </Text>
      </section>
    </Modal>
  );
};
