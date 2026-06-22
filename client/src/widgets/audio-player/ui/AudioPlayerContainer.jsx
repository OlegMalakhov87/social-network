import { useSelector } from 'react-redux';
import { useAudioPlayer, AudioPlayer } from '../../audio-player';

/**
 * Подключает состояние Redux и методы контекста к UI-компоненту {@link AudioPlayer}.
 * @returns {JSX.Element}
 */
export const AudioPlayerContainer = () => {
  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    progress,
    currentTime,
    duration,
    isLoading,
    error,
  } = useSelector((state) => state.audioPlayer);

  const {
    togglePlay,
    seekPercent,
    next,
    prev,
    setRepeat,
    toggleShuffle,
    setVolume,
    toggleMute,
    close,
    repeat,
    shuffle,
    formatTime,
  } = useAudioPlayer();

  return (
    <AudioPlayer
      currentTrack={currentTrack}
      isPlaying={isPlaying}
      volume={volume}
      isMuted={isMuted}
      progress={progress}
      currentTime={currentTime}
      duration={duration}
      isLoading={isLoading}
      error={error}
      onTogglePlay={togglePlay}
      onSeekPercent={seekPercent}
      onNext={next}
      onPrev={prev}
      onSetRepeat={setRepeat}
      onToggleShuffle={toggleShuffle}
      onVolumeChange={setVolume}
      onToggleMute={toggleMute}
      onClose={close}
      repeat={repeat}
      shuffle={shuffle}
      formatTime={formatTime}
    />
  );
};
