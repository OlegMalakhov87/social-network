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
import {
  clearPlayer,
  nextTrack,
  prevTrack,
  setQueue,
  setRepeat,
  toggleShuffle,
  updatePlayerState,
} from '..';
import { useMediaControls } from '../../../shared/hooks';

/**
 * Контекст аудиоплеера. Предоставляет методы управления и текущее состояние плеера всем компонентам через {@link useAudioPlayer}.
 * @type {React.Context}
 */
const AudioPlayerContext = createContext(null);

/**
 * Хук для доступа к контексту аудиоплеера.
 * @returns {Object} методы и текущее состояние плеера
 * @throws {Error} если используется вне AudioPlayerProvider
 */
export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  }
  return context;
};

/**
 * Провайдер аудиоплеера. Создаёт скрытый аудио-элемент, синхронизирует
 * Redux-состояние с DOM-событиями и предоставляет методы управления через контекст.
 * @param {Object} props
 * @param {React.ReactNode} props.children - контент провайдера
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
  /** Проверка авторизации */
  const isAuthenticated = useSelector(selectIsAuthenticated);

  /** Режим повтора */
  repeatRef.current = repeat;

  /** Текущий трек */
  currentTrackRef.current = currentTrack;

  /** Обработчик изменения состояния плеера */
  const stateChangeHandler = useCallback(
    (state) => dispatch(updatePlayerState(state)),
    [dispatch]
  );

  /** Контролы медиа элемента */
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

  /** Воспроизведение трека */
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

  /** Очистка плеера */
  useEffect(() => {
    if (currentTrack) return;
    clearSource();
    trackStartedRef.current = false;
    prevTrackId.current = null;
    dispatch(updatePlayerState({ currentTime: 0, duration: 0, progress: 0 }));
  }, [currentTrack, clearSource, dispatch]);

  // При выходе из аккаунта гарантированно останавливаем и закрываем плеер.
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

  /** Воспроизведение трека */
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

  /** Воспроизведение трека */
  const play = useCallback(() => {
    if (!currentTrack?.audioUrl) return;
    mediaPlay();
  }, [currentTrack, mediaPlay]);

  /** Пауза воспроизведения */
  const pause = useCallback(() => {
    mediaPause();
  }, [mediaPause]);

  /** Установка колбэка при начале воспроизведения */
  const setOnTrackStart = useCallback((fn) => {
    onTrackStartCallbackRef.current = fn;
  }, []);

  /** Значение контекста */
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
