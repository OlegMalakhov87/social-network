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

  useEffect(() => {
    if (stateVolume !== undefined) setVolume(stateVolume);
  }, [stateVolume]);

  useEffect(() => {
    if (stateMuted !== undefined) setIsMuted(stateMuted);
  }, [stateMuted]);

  useLayoutEffect(() => {
    if (!mediaRef?.current) return;
    setMediaElement(mediaRef.current);
  }, [mediaRef]);

  useEffect(() => {
    if (!mediaElement) return;
    mediaElement.volume = volume;
    mediaElement.muted = isMuted;
  }, [mediaElement, volume, isMuted]);

  const onEndRef = useRef(onEnd);
  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  const onPlayExtraRef = useRef(onPlayExtra);
  useEffect(() => {
    onPlayExtraRef.current = onPlayExtra;
  }, [onPlayExtra]);

  useEffect(() => {
    const media = mediaElement;
    if (!media) return;

    const onTimeUpdate = () => {
      const currentTime = media.currentTime;
      const duration = media.duration || 0;
      onStateChange?.({
        currentTime,
        duration,
        progress: duration ? currentTime / duration : 0,
      });
    };

    const onPlay = () => {
      onStateChange?.({ isPlaying: true, isLoading: false });
      onPlayExtraRef.current?.();
    };
    const onPause = () => onStateChange?.({ isPlaying: false });
    const onLoadedMetadata = () => {
      onStateChange?.({ duration: media.duration || 0, isLoading: false });
    };
    const onEnded = () => {
      onStateChange?.({ isPlaying: false });
      onEndRef.current?.();
    };
    const onError = () => {
      onStateChange?.({
        isLoading: false,
        error: 'Не удалось загрузить аудио. Проверьте ссылку на файл.',
      });
    };
    const onLoadStart = () => onStateChange?.({ isLoading: true, error: null });
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

  const seekPercent = useCallback(
    (percent) => {
      if (!mediaElement || !mediaElement.duration) return;
      const time = mediaElement.duration * Math.max(0, Math.min(1, percent));
      mediaElement.currentTime = time;
      onStateChange?.({ currentTime: time });
    },
    [mediaElement, onStateChange]
  );

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

  const toggleMute = useCallback(() => {
    setIsMuted((muted) => {
      const next = !muted;
      onStateChange?.({ isMuted: next });
      return next;
    });
  }, [onStateChange]);

  const setSource = useCallback(
    (url) => {
      const media = mediaElement ?? mediaRef?.current;
      if (!media || !url) return false;
      media.src = url;
      media.load();
      return true;
    },
    [mediaElement, mediaRef]
  );

  const clearSource = useCallback(() => {
    const media = mediaElement ?? mediaRef?.current;
    if (!media) return;
    media.pause();
    media.src = '';
    media.removeAttribute('src');
  }, [mediaElement, mediaRef]);

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
