import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { formatDuration } from '../utils';

/**
 * Управляет воспроизведением, громкостью и источником медиаэлемента.
 *
 * @param {Object} params - Параметры управления
 * @param {import('react').RefObject<HTMLMediaElement>} params.mediaRef - Ссылка на аудио или видео
 * @param {number} [params.stateVolume] - Громкость из внешнего состояния
 * @param {boolean} [params.stateMuted] - Признак без звука из внешнего состояния
 * @param {boolean} [params.autoPlay] - Запускает воспроизведение при смене элемента
 * @param {Object} [params.options={}] - Дополнительные обработчики
 * @param {Function} [params.options.onEnd] - Вызывается в конце воспроизведения
 * @param {Function} [params.options.onPlay] - Вызывается при начале воспроизведения
 * @param {Function} [params.options.onStateChange] - Получает изменение состояния
 * @returns {{
 *   play: Function,
 *   pause: Function,
 *   toggle: Function,
 *   seekPercent: Function,
 *   changeVolume: Function,
 *   toggleMute: Function,
 *   setSource: Function,
 *   clearSource: Function,
 *   playOnMedia: Function,
 *   formatDuration: Function,
 *   isMediaReady: boolean,
 *   volume: number,
 *   isMuted: boolean
 * }} Методы управления, готовность элемента, громкость и признак без звука.
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

  // Применяет громкость из внешнего состояния.
  useEffect(() => {
    if (stateVolume !== undefined) setVolume(stateVolume);
  }, [stateVolume]);

  // Применяет признак без звука из внешнего состояния.
  useEffect(() => {
    if (stateMuted !== undefined) setIsMuted(stateMuted);
  }, [stateMuted]);

  // Запоминает текущий медиаэлемент.
  useLayoutEffect(() => {
    if (!mediaRef?.current) return;
    setMediaElement(mediaRef.current);
  }, [mediaRef]);

  // Применяет громкость и признак без звука к медиаэлементу.
  useEffect(() => {
    if (!mediaElement) return;
    mediaElement.volume = volume;
    mediaElement.muted = isMuted;
  }, [mediaElement, volume, isMuted]);

  // Хранит актуальный обработчик окончания, чтобы не подписываться заново.
  const onEndRef = useRef(onEnd);

  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  // Хранит актуальный обработчик начала воспроизведения, чтобы не подписываться заново.
  const onPlayExtraRef = useRef(onPlayExtra);

  useEffect(() => {
    onPlayExtraRef.current = onPlayExtra;
  }, [onPlayExtra]);

  // Синхронизирует состояние воспроизведения с событиями медиаэлемента.
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

  /**
   * Запускает воспроизведение.
   *
   * @returns {Promise<void>}
   */
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

  /**
   * Ставит воспроизведение на паузу.
   *
   * @returns {void}
   */
  const pause = useCallback(() => {
    mediaElement?.pause();
  }, [mediaElement]);

  /**
   * Переключает воспроизведение и паузу.
   *
   * @returns {Promise<void>}
   */
  const toggle = useCallback(async () => {
    if (!mediaElement) return;
    if (mediaElement.paused) await play();
    else pause();
  }, [mediaElement, play, pause]);

  /**
   * Перематывает воспроизведение на долю длительности.
   *
   * @param {number} percent - Доля от 0 до 1
   * @returns {void}
   */
  const seekPercent = useCallback(
    (percent) => {
      if (!mediaElement || !mediaElement.duration) return;
      const time = mediaElement.duration * Math.max(0, Math.min(1, percent));
      mediaElement.currentTime = time;
      onStateChange?.({ currentTime: time });
    },
    [mediaElement, onStateChange]
  );

  /**
   * Меняет громкость и снимает беззвучие при значении больше нуля.
   *
   * @param {number} vol - Громкость от 0 до 1
   * @returns {void}
   */
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

  /**
   * Переключает беззвучие.
   *
   * @returns {void}
   */
  const toggleMute = useCallback(() => {
    setIsMuted((muted) => {
      const next = !muted;
      onStateChange?.({ isMuted: next });
      return next;
    });
  }, [onStateChange]);

  /**
   * Назначает адрес источника и сбрасывает позицию.
   *
   * @param {string} url - Адрес источника
   * @returns {boolean} Признак назначенного источника.
   */
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

  /**
   * Удаляет источник и останавливает воспроизведение.
   *
   * @returns {void}
   */
  const clearSource = useCallback(() => {
    const media = mediaElement ?? mediaRef?.current;
    if (!media) return;
    media.pause();
    media.currentTime = 0;
    media.src = '';
    media.removeAttribute('src');
    media.load();
  }, [mediaElement, mediaRef]);

  /**
   * Запускает воспроизведение на текущем медиаэлементе.
   *
   * @returns {Promise<void>}
   */
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
