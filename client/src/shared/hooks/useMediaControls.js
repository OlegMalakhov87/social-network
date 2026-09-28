import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { formatDuration } from '../utils';

/**
 * Хук для управления HTMLMediaElement.
 * Инкапсулирует подписку на события, перемотку, громкость и синхронизацию состояния.
 *
 * @param {Object} params
 * @param {React.RefObject<HTMLMediaElement>} params.mediaRef - реф на аудио/видео элемент
 * @param {number} [params.stateVolume] - громкость из внешнего store
 * @param {boolean} [params.stateMuted] - mute из внешнего store
 * @param {boolean} [params.autoPlay] - автовоспроизведение при смене mediaElement
 * @param {Object} [params.options={}] - дополнительные настройки
 * @param {Function} [params.options.onEnd] - колбэк при окончании трека
 * @param {Function} [params.options.onPlay] - колбэк при событии play
 * @param {Function} [params.options.onStateChange] - колбэк при изменении состояния
 * @returns {Object} - объект с методами управления, volume и isMuted
 */
export const useMediaControls = ({
  mediaRef,
  stateVolume,
  stateMuted,
  autoPlay,
  options = {},
}) => {
  const { onEnd, onPlay: onPlayExtra, onStateChange } = options;

  const [mediaElement, setMediaElement] = useState(null);
  const [volume, setVolume] = useState(stateVolume ?? 1);
  const [isMuted, setIsMuted] = useState(stateMuted ?? false);

  /** Обновление громкости из внешнего store */
  useEffect(() => {
    if (stateVolume !== undefined) setVolume(stateVolume);
  }, [stateVolume]);

  /** Обновление состояния громкости из внешнего store */
  useEffect(() => {
    if (stateMuted !== undefined) setIsMuted(stateMuted);
  }, [stateMuted]);

  /** Установка mediaElement при монтировании */
  useLayoutEffect(() => {
    if (!mediaRef?.current) return;
    setMediaElement(mediaRef.current);
  }, [mediaRef]);

  /** Установка громкости и состояния громкости при изменении */
  useEffect(() => {
    if (!mediaElement) return;
    mediaElement.volume = volume;
    mediaElement.muted = isMuted;
  }, [mediaElement, volume, isMuted]);

  /** Реф на колбэк при окончании трека */
  const onEndRef = useRef(onEnd);

  /** Обновление колбэка при изменении */
  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  /** Реф на колбэк при воспроизведении трека */
  const onPlayExtraRef = useRef(onPlayExtra);

  /** Обновление колбэка при изменении */
  useEffect(() => {
    onPlayExtraRef.current = onPlayExtra;
  }, [onPlayExtra]);

  /** Обновление состояния при изменении времени воспроизведения */
  useEffect(() => {
    const media = mediaElement;
    if (!media) return;

    /** Обработчик изменении времени воспроизведения */
    const onTimeUpdate = () => {
      const currentTime = media.currentTime;
      const duration = media.duration || 0;
      onStateChange?.({
        currentTime,
        duration,
        progress: duration ? currentTime / duration : 0,
      });
    };

    /** Обработчик воспроизведения трека */
    const onPlay = () => {
      onStateChange?.({ isPlaying: true, isLoading: false });
      onPlayExtraRef.current?.();
    };

    /** Обработчик паузы трека */
    const onPause = () => onStateChange?.({ isPlaying: false });

    /** Обработчик загрузки метаданных трека */
    const onLoadedMetadata = () => {
      onStateChange?.({ duration: media.duration || 0, isLoading: false });
    };

    /** Обработчик окончания трека */
    const onEnded = () => {
      onStateChange?.({ isPlaying: false });
      onEndRef.current?.();
    };

    /** Обработчик ошибки загрузки трека */
    const onError = () => {
      onStateChange?.({
        isLoading: false,
        error: 'Не удалось загрузить аудио. Проверьте ссылку на файл.',
      });
    };

    /** Обработчик начала загрузки трека */
    const onLoadStart = () => onStateChange?.({ isLoading: true, error: null });

    /** Обработчик загрузки трека */
    const onCanPlay = () => onStateChange?.({ isLoading: false });

    if (autoPlay) {
      media.play().catch((err) => {
        if (!['AbortError', 'NotAllowedError'].includes(err.name)) {
          onStateChange?.({ error: 'Автовоспроизведение заблокировано' });
        }
      });
    }

    media.addEventListener('timeupdate', onTimeUpdate);
    media.addEventListener('play', onPlay);
    media.addEventListener('pause', onPause);
    media.addEventListener('loadedmetadata', onLoadedMetadata);
    media.addEventListener('ended', onEnded);
    media.addEventListener('error', onError);
    media.addEventListener('loadstart', onLoadStart);
    media.addEventListener('canplay', onCanPlay);

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

  /** Воспроизведение трека */
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

  /** Пауза трека */
  const pause = useCallback(() => {
    mediaElement?.pause();
  }, [mediaElement]);

  /** Переключение воспроизведения/паузы */
  const toggle = useCallback(async () => {
    if (!mediaElement) return;
    if (mediaElement.paused) await play();
    else pause();
  }, [mediaElement, play, pause]);

  /** Перемотка на определенный процент */
  const seekPercent = useCallback(
    (percent) => {
      if (!mediaElement || !mediaElement.duration) return;
      const time = mediaElement.duration * Math.max(0, Math.min(1, percent));
      mediaElement.currentTime = time;
      onStateChange?.({ currentTime: time });
    },
    [mediaElement, onStateChange]
  );

  /** Изменение громкости */
  const changeVolume = useCallback(
    (vol) => {
      const v = Math.max(0, Math.min(1, vol));
      setVolume(v);
      const patch = { volume: v };
      if (v > 0 && isMuted) {
        setIsMuted(false);
        patch.isMuted = false;
      }
      onStateChange?.(patch);
    },
    [isMuted, onStateChange]
  );

  /** Переключение мута (вкл/выкл) */
  const toggleMute = useCallback(() => {
    setIsMuted((muted) => {
      const next = !muted;
      onStateChange?.({ isMuted: next });
      return next;
    });
  }, [onStateChange]);

  /** Установка источника (URL) */
  const setSource = useCallback(
    (url) => {
      const media = mediaElement ?? mediaRef?.current;
      if (!media || !url) return false;
      media.pause();
      media.currentTime = 0;
      media.src = url;
      media.load();
      return true;
    },
    [mediaElement, mediaRef]
  );

  /** Очистка источника */
  const clearSource = useCallback(() => {
    const media = mediaElement ?? mediaRef?.current;
    if (!media) return;
    media.pause();
    media.currentTime = 0;
    media.src = '';
    media.removeAttribute('src');
    media.load();
  }, [mediaElement, mediaRef]);

  /** Воспроизведение трека на медиа элементе */
  const playOnMedia = useCallback(async () => {
    const media = mediaElement ?? mediaRef?.current;
    if (!media) return;
    try {
      await media.play();
    } catch (err) {
      if (!['AbortError', 'NotAllowedError'].includes(err.name)) {
        onStateChange?.({ error: 'Ошибка воспроизведения. Попробуйте позже.' });
      }
    }
  }, [mediaElement, mediaRef, onStateChange]);

  return {
    play,
    pause,
    toggle,
    seekPercent,
    changeVolume,
    toggleMute,
    setSource,
    clearSource,
    playOnMedia,
    formatDuration,
    isMediaReady: Boolean(mediaElement ?? mediaRef?.current),
    volume,
    isMuted,
  };
};
