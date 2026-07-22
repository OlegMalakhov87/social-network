import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Хук для управления HTMLMediaElement. Инкапсулирует подписку на события, перемотку, громкость и синхронизацию состояния.
 *
 * @param {Object} params - параметры запроса
 * @param {React.RefObject<HTMLMediaElement>} params.mediaRef - реф на аудио/видео элемент
 * @param {number} params.stateVolume - начальная громкость
 * @param {boolean} params.autoPlay - автовоспроизведение
 * @param {Object} [params.options={}] - дополнительные настройки
 * @param {Function} [params.options.onEnd] - колбэк при окончании трека
 * @param {Function} [params.options.onStateChange] - колбэк при изменении состояния (currentTime, duration, progress, isPlaying, isLoading, error)
 * @returns {Object} - объект с методами управления и геттерами volume/isMuted
 */
export const useMediaControls = ({
  mediaRef,
  stateVolume,
  autoPlay,
  options = {},
}) => {
  const { onEnd, onStateChange } = options;

  // DOM-элемент, к которому привязан ref (извлекается один раз при монтировании)
  const [mediaElement, setMediaElement] = useState(null);
  // Локальное состояние громкости и mute (чтобы не дёргать DOM без нужды)
  const [volume, setVolume] = useState(stateVolume);
  const [isMuted, setIsMuted] = useState(false);

  // Синхронизация mediaElement с текущим значением ref
  useEffect(() => {
    setMediaElement(mediaRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaRef.current]);

  // Применяем громкость и mute к реальному элементу при их изменении
  useEffect(() => {
    if (!mediaElement) return;
    mediaElement.volume = volume;
    mediaElement.muted = isMuted;
  }, [mediaElement, volume, isMuted]);

  // Сохраняем актуальный колбэк onEnd в рефе, чтобы не пересоздавать слушатели
  const onEndRef = useRef(onEnd);
  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  // Основной эффект: подписка на события медиа-элемента
  useEffect(() => {
    const media = mediaElement;
    if (!media) return;

    // Обработчики событий
    const onTimeUpdate = () => {
      const currentTime = media.currentTime;
      const duration = media.duration || 0;
      onStateChange?.({
        currentTime,
        duration,
        progress: duration ? currentTime / duration : 0,
      });
    };

    const onPlay = () => onStateChange?.({ isPlaying: true, isLoading: false });
    const onPause = () => onStateChange?.({ isPlaying: false });
    const onLoadedMetadata = () => {
      onStateChange?.({ duration: media.duration || 0, isLoading: false });
    };
    const onEnded = () => {
      onStateChange?.({ isPlaying: false });
      onEndRef.current?.(); // вызываем актуальный onEnd
    };
    const onError = () => {
      onStateChange?.({
        isLoading: false,
        error: 'Не удалось загрузить аудио. Проверьте ссылку на файл.',
      });
    };
    const onLoadStart = () => onStateChange?.({ isLoading: true, error: null });
    const onCanPlay = () => onStateChange?.({ isLoading: false });

    // Попытка автовоспроизведения (если разрешено)
    if (autoPlay) {
      media.play().catch((err) => {
        if (!['AbortError', 'NotAllowedError'].includes(err.name)) {
          onStateChange?.({ error: 'Автовоспроизведение заблокировано' });
        }
      });
    }

    // Подписка на события
    media.addEventListener('timeupdate', onTimeUpdate);
    media.addEventListener('play', onPlay);
    media.addEventListener('pause', onPause);
    media.addEventListener('loadedmetadata', onLoadedMetadata);
    media.addEventListener('ended', onEnded);
    media.addEventListener('error', onError);
    media.addEventListener('loadstart', onLoadStart);
    media.addEventListener('canplay', onCanPlay);

    // Отписка при размонтировании или смене mediaElement
    return () => {
      media.removeEventListener('timeupdate', onTimeUpdate);
      media.removeEventListener('play', onPlay);
      media.removeEventListener('pause', onPause);
      media.removeEventListener('loadedmetadata', onLoadedMetadata);
      media.removeEventListener('ended', onEnded);
      media.removeEventListener('error', onError);
      media.removeEventListener('loadstart', onLoadStart);
      media.removeEventListener('canplay', onCanPlay);
    };
  }, [mediaElement, onStateChange, autoPlay]);

  // Методы управления воспроизведением
  const play = useCallback(async () => {
    if (!mediaElement) return;
    try {
      await mediaElement.play();
    } catch (err) {
      if (!['AbortError', 'NotAllowedError'].includes(err.name)) {
        onStateChange?.({ error: 'Ошибка воспроизведения. Попробуйте позже.' });
      }
    }
  }, [mediaElement, onStateChange]);

  const pause = useCallback(() => {
    mediaElement?.pause();
  }, [mediaElement]);

  const toggle = useCallback(async () => {
    if (!mediaElement) return;
    if (mediaElement.paused) await play();
    else pause();
  }, [mediaElement, play, pause]);

  // Перемотка (процент от 0 до 1)
  const seekPercent = useCallback(
    (percent) => {
      if (!mediaElement || !mediaElement.duration) return;
      const time = mediaElement.duration * Math.max(0, Math.min(1, percent));
      mediaElement.currentTime = time;
      onStateChange?.({ currentTime: time });
    },
    [mediaElement, onStateChange]
  );

  // Управление громкостью
  const changeVolume = useCallback(
    (vol) => {
      const v = Math.max(0, Math.min(1, vol));
      setVolume(v);
      if (v > 0 && isMuted) setIsMuted(false);
    },
    [isMuted]
  );

  const toggleMute = useCallback(() => setIsMuted((m) => !m), []);

  // Форматирование секунд в "мм:сс"
  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Возвращаем методы и геттеры (volume и isMuted – реактивные)
  return {
    play,
    pause,
    toggle,
    seekPercent,
    changeVolume,
    toggleMute,
    formatTime,
    get volume() {
      return volume;
    },
    get isMuted() {
      return isMuted;
    },
  };
};
