import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { selectIsAuthenticated } from '../../../entities/auth';
import { useMediaControls } from '../../../shared/hooks';
import {
  clearPlayer,
  nextTrack,
  prevTrack,
  setQueue,
  setRepeat,
  toggleShuffle,
  updatePlayerState,
} from '..';

/**
 * Хранит состояние и управление аудиоплеером.
 *
 * @type {React.Context<Object|null>}
 */
const AudioPlayerContext = createContext(null);

/**
 * Возвращает состояние и управление аудиоплеером.
 *
 * @returns {Object} Состояние и методы плеера.
 * @throws {Error} Выбрасывает ошибку вне провайдера аудиоплеера.
 */
export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  }
  return context;
};

/**
 * Предоставляет состояние и управление аудиоплеером.
 *
 * @param {Object} props - Свойства компонента
 * @param {React.ReactNode} props.children - Вложенная разметка
 * @returns {JSX.Element} Разметка провайдера.
 */
export const AudioPlayerProvider = ({ children }) => {
  const dispatch = useDispatch();
  const audioRef = useRef(null);
  const prevTrackId = useRef(null);
  const onTrackStartCallbackRef = useRef(null);
  const trackStartedRef = useRef(false);
  const repeatRef = useRef('off');
  const currentTrackRef = useRef(null);
  const mediaControlsRef = useRef(null);
  const wasAuthenticatedRef = useRef(false);

  const {
    currentTrack,
    queue,
    currentIndex,
    repeat,
    shuffle,
    isPlaying,
    volume,
    isMuted,
  } = useSelector((state) => state.audioPlayer);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  repeatRef.current = repeat;

  currentTrackRef.current = currentTrack;

  /**
   * Записывает состояние медиаэлемента в Redux.
   *
   * @param {Object} state - Состояние воспроизведения
   */
  const stateChangeHandler = useCallback(
    (state) => dispatch(updatePlayerState(state)),
    [dispatch]
  );

  const mediaControls = useMediaControls({
    mediaRef: audioRef,
    stateVolume: volume,
    stateMuted: isMuted,
    options: {
      onEnd: () => {
        if (repeatRef.current === 'one') {
          trackStartedRef.current = false;
          mediaControlsRef.current?.seekPercent(0);
          mediaControlsRef.current?.play();
        } else {
          dispatch(nextTrack());
        }
      },
      onPlay: () => {
        // Сообщает о старте один раз за трек.
        if (!trackStartedRef.current && onTrackStartCallbackRef.current) {
          trackStartedRef.current = true;
          onTrackStartCallbackRef.current(currentTrackRef.current);
        }
      },
      onStateChange: stateChangeHandler,
    },
  });

  mediaControlsRef.current = mediaControls;

  const {
    play: mediaPlay,
    pause: mediaPause,
    toggle: togglePlay,
    seekPercent,
    changeVolume,
    toggleMute,
    setSource,
    clearSource,
    playOnMedia,
    formatDuration,
    isMediaReady,
  } = mediaControls;

  // Загружает источник один раз на трек и запускает воспроизведение.
  useEffect(() => {
    if (!isMediaReady || !currentTrack?.audioUrl) return;
    if (prevTrackId.current === currentTrack.id) return;

    prevTrackId.current = currentTrack.id;
    trackStartedRef.current = false;
    dispatch(
      updatePlayerState({
        error: null,
        currentTime: 0,
        duration: 0,
        progress: 0,
        isLoading: true,
      })
    );

    if (!setSource(currentTrack.audioUrl)) return;

    playOnMedia();
  }, [currentTrack, isMediaReady, dispatch, setSource, playOnMedia]);

  // Очищает медиаэлемент, когда текущий трек отсутствует.
  useEffect(() => {
    if (currentTrack) return;
    clearSource();
    trackStartedRef.current = false;
    prevTrackId.current = null;
    dispatch(updatePlayerState({ currentTime: 0, duration: 0, progress: 0 }));
  }, [currentTrack, clearSource, dispatch]);

  // Останавливает и закрывает плеер при выходе из аккаунта.
  useEffect(() => {
    if (wasAuthenticatedRef.current && !isAuthenticated) {
      clearSource();
      dispatch(clearPlayer());
      onTrackStartCallbackRef.current = null;
      trackStartedRef.current = false;
      prevTrackId.current = null;
    }

    wasAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated, clearSource, dispatch]);

  /**
   * Ставит выбранный трек в очередь и запускает воспроизведение.
   *
   * @param {Object} track - Трек для воспроизведения
   * @param {Array<Object>} [trackList] - Очередь треков
   */
  const playTrack = useCallback(
    (track, trackList) => {
      if (!track?.audioUrl) return;

      const list =
        Array.isArray(trackList) && trackList.length ? trackList : [track];

      const idx = list.findIndex((t) => t.id === track.id);

      dispatch(setQueue({ queue: list, currentIndex: idx >= 0 ? idx : 0 }));
    },
    [dispatch]
  );

  const play = useCallback(() => {
    if (!currentTrack?.audioUrl) return;
    mediaPlay();
  }, [currentTrack, mediaPlay]);

  const pause = useCallback(() => {
    mediaPause();
  }, [mediaPause]);

  /**
   * Сохраняет обработчик старта трека.
   *
   * @param {Function|null} fn - Обработчик начала воспроизведения
   */
  const setOnTrackStart = useCallback((fn) => {
    onTrackStartCallbackRef.current = fn;
  }, []);

  const value = useMemo(
    () => ({
      pause,
      play,
      setOnTrackStart,
      currentTrack,
      queue,
      currentIndex,
      isPlaying,
      repeat,
      shuffle,
      formatTime: formatDuration,
      playTrack,
      next: () => dispatch(nextTrack()),
      prev: () => dispatch(prevTrack()),
      close: () => {
        clearSource();
        dispatch(clearPlayer());
        prevTrackId.current = null;
        trackStartedRef.current = false;
      },
      /**
       * Записывает режим повтора.
       *
       * @param {string} mode - Режим повтора: off, one или all
       */
      setRepeat: (mode) => dispatch(setRepeat(mode)),
      toggleShuffle: () => dispatch(toggleShuffle()),
      togglePlay,
      seekPercent,
      setVolume: changeVolume,
      toggleMute,
    }),
    [
      currentTrack,
      isPlaying,
      queue,
      currentIndex,
      repeat,
      shuffle,
      playTrack,
      setOnTrackStart,
      dispatch,
      formatDuration,
      changeVolume,
      toggleMute,
      pause,
      play,
      togglePlay,
      seekPercent,
      clearSource,
    ]
  );

  return (
    <AudioPlayerContext.Provider value={value}>
      <audio ref={audioRef} preload="none" style={{ display: 'none' }} />
      {children}
    </AudioPlayerContext.Provider>
  );
};
