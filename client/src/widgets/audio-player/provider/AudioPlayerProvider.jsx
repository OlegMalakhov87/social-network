import { createContext, useContext, useRef, useCallback, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMediaControls } from '../../../shared/lib';
import {
  setQueue,
  nextTrack,
  prevTrack,
  clearPlayer,
  setRepeat,
  toggleShuffle,
  updatePlayerState,
} from '..';

/**
 * Контекст аудиоплеера. Предоставляет методы управления и текущее состояние
 * всем компонентам через {@link useAudioPlayer}.
 * @type {React.Context}
 */
const AudioPlayerContext = createContext(null);

/**
 * Хук для доступа к контексту аудиоплеера.
 * @returns {Object} Методы и состояние плеера
 * @throws {Error} Если используется вне AudioPlayerProvider
 */
export const useAudioPlayer = () => useContext(AudioPlayerContext);

/**
 * Провайдер аудиоплеера. Создаёт скрытый аудио-элемент, синхронизирует
 * Redux-состояние с DOM-событиями и предоставляет методы управления через контекст.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export const AudioPlayerProvider = ({ children }) => {
  const dispatch = useDispatch();
  const audioRef = useRef(null);
  const prevTrackId = useRef(null);
  const onTrackStartCallbackRef = useRef(null);
  const trackStartedRef = useRef(false);

  const { currentTrack, queue, currentIndex, repeat, shuffle, isPlaying, volume } = useSelector(
    (state) => state.audioPlayer
  );

  const stateChangeHandler = useCallback((state) => dispatch(updatePlayerState(state)), [dispatch]);

  const mediaControls = useMediaControls(audioRef, volume, {
    onEnd: () => {
      if (repeat === 'one' && audioRef.current) {
        trackStartedRef.current = false;
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      } else {
        dispatch(nextTrack());
      }
    },
    onStateChange: stateChangeHandler,
  });

  useEffect(() => {
    if (!audioRef.current || !currentTrack?.fileUrl) return;

    if (prevTrackId.current === currentTrack.id) return;
    prevTrackId.current = currentTrack.id;
    const audio = audioRef.current;
    audio.src = currentTrack.fileUrl;
    dispatch(updatePlayerState({ error: null }));
    audio.load();
    audio.play().catch((err) => {
      if (!['AbortError', 'NotAllowedError'].includes(err.name)) {
        dispatch(updatePlayerState({ error: 'Не удалось воспроизвести файл' }));
      }
    });
  }, [currentTrack, dispatch]);

  const setVolume = useCallback(
    (vol) => {
      if (audioRef.current) {
        audioRef.current.volume = vol;
      }
      dispatch(updatePlayerState({ volume: vol, isMuted: vol === 0 ? false : undefined }));
    },
    [dispatch]
  );

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      const newMuted = audioRef.current.muted;
      dispatch(updatePlayerState({ isMuted: newMuted }));
    }
  }, [dispatch]);

  const playTrack = useCallback(
    (track, trackList) => {
      if (!track?.fileUrl || !audioRef.current) return;
      const list = Array.isArray(trackList) && trackList.length ? trackList : [track];
      const idx = list.findIndex((t) => t.id === track.id);
      dispatch(setQueue({ queue: list, currentIndex: idx >= 0 ? idx : 0 }));
    },
    [dispatch]
  );

  const pause = useCallback(() => {
    audioRef.current?.pause();
    dispatch(updatePlayerState({ isPlaying: false }));
  }, [dispatch]);

  const play = useCallback(() => {
    if (!audioRef.current || !currentTrack?.fileUrl) return;
    audioRef.current.play().catch((err) => {
      if (!['AbortError', 'NotAllowedError'].includes(err.name)) {
        dispatch(updatePlayerState({ error: 'Ошибка воспроизведения' }));
      }
    });
    dispatch(updatePlayerState({ isPlaying: true }));
  }, [dispatch, currentTrack]);

  const setOnTrackStart = useCallback((fn) => {
    onTrackStartCallbackRef.current = fn;
  }, []);

  // Эффект для вызова onTrackStart при начале воспроизведения нового трека
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => {
      // Проверяем, что трек ещё не был засчитан в этой сессии
      if (!trackStartedRef.current && onTrackStartCallbackRef.current) {
        trackStartedRef.current = true;
        onTrackStartCallbackRef.current(currentTrack);
      }
    };

    audio.addEventListener('play', handlePlay);
    return () => {
      audio.removeEventListener('play', handlePlay);
    };
  }, [currentTrack]); // переподписываемся при смене трека

  // Сбрасываем флаг при смене трека
  useEffect(() => {
    trackStartedRef.current = false;
  }, [currentTrack]);

  // Останавливаем аудио и сбрасываем src, когда плеер закрывается (currentTrack === null)
  useEffect(() => {
    if (!currentTrack && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current.removeAttribute('src');
      trackStartedRef.current = false;
      prevTrackId.current = null;
    }
  }, [currentTrack]);

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
      formatTime: mediaControls.formatTime,
      playTrack,
      next: () => dispatch(nextTrack()),
      prev: () => dispatch(prevTrack()),
      close: () => {
        audioRef.current?.pause();
        dispatch(clearPlayer());
        prevTrackId.current = null;
        trackStartedRef.current = false;
      },
      setRepeat: (mode) => dispatch(setRepeat(mode)),
      toggleShuffle: () => dispatch(toggleShuffle()),
      togglePlay: mediaControls.toggle,
      seekPercent: mediaControls.seekPercent,
      setVolume,
      toggleMute,
      audioRef,
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
      mediaControls,
      setVolume,
      toggleMute,
      pause,
      play,
    ]
  );

  return (
    <AudioPlayerContext.Provider value={value}>
      <audio ref={audioRef} preload="none" style={{ display: 'none' }} />
      {children}
    </AudioPlayerContext.Provider>
  );
};
