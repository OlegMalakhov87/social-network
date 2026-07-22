import { Image } from '../../../shared/ui';
import style from './AudioPlayer.module.css';

/**
 * Презентационный компонент панели аудиоплеера.
 * @param {Object} props
 * @param {Object} props.currentTrack - текущий трек
 * @param {boolean} props.isPlaying - воспроизводится ли текущий трек
 * @param {number} props.volume - громкость воспроизведения
 * @param {boolean} props.isMuted - включен ли звук
 * @param {number} props.progress - прогресс воспроизведения
 * @param {number} props.currentTime - текущее время воспроизведения
 * @param {number} props.duration - общая длительность трека
 * @param {Function} props.formatTime - функция форматирования времени
 * @param {boolean} props.isLoading - загружается ли текущий трек
 * @param {string} props.error - сообщение об ошибке
 * @param {Function} props.onTogglePlay - функция переключения воспроизведения
 * @param {Function} props.onSeekPercent - функция изменения прогресса воспроизведения
 * @param {Function} props.onNext - функция переключения на следующий трек
 * @param {Function} props.onPrev - функция переключения на предыдущий трек
 * @param {Function} props.onSetRepeat - функция изменения режима повторения
 * @param {Function} props.onToggleShuffle - функция переключения режима перемешивания
 * @param {Function} props.onVolumeChange - функция изменения громкости
 * @param {Function} props.onToggleMute - функция переключения звука
 * @param {Function} props.onClose - функция закрытия плеера
 * @param {string} props.repeat - режим повторения
 * @param {boolean} props.shuffle - режим перемешивания
 * @returns {JSX.Element|null} возвращает разметку плеера или null, если нет трека
 */
export const AudioPlayer = ({
  currentTrack,
  isPlaying,
  volume,
  isMuted,
  progress,
  currentTime,
  duration,
  formatTime,
  isLoading,
  error,
  onTogglePlay,
  onSeekPercent,
  onNext,
  onPrev,
  onSetRepeat,
  onToggleShuffle,
  onVolumeChange,
  onToggleMute,
  onClose,
  repeat,
  shuffle,
}) => {
  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    onSeekPercent(Math.max(0, Math.min(1, percent)));
  };

  const handleProgressKeyDown = (e) => {
    if (e.key === 'ArrowLeft') onSeekPercent(Math.max(0, progress - 0.05));
    else if (e.key === 'ArrowRight')
      onSeekPercent(Math.min(1, progress + 0.05));
  };

  if (!currentTrack?.fileUrl) return null;

  return (
    <div className={style.playerBar}>
      {error && <div className={style.errorToast}>{error}</div>}

      <div className={style.playerInfo}>
        <Image
          src={currentTrack.cover}
          alt={currentTrack.title}
          width={50}
          height={50}
          className={style.playerCover}
          fallbackSrc="/error.png"
        />
        <div className={style.trackDetails}>
          <div className={style.playerTrack}>{currentTrack.title}</div>
          <div className={style.playerArtist}>{currentTrack.artist}</div>
          {isLoading && <span className={style.loadingText}>Загрузка...</span>}
        </div>
      </div>

      <div className={style.playerControls}>
        <div className={style.controlButtons}>
          <button
            onClick={(e) => {
              e?.stopPropagation();
              onPrev?.();
            }}
            aria-label="Предыдущий трек"
          >
            ⏮️
          </button>
          <button
            onClick={(e) => {
              e?.stopPropagation();
              onTogglePlay?.();
            }}
            aria-label={isPlaying ? 'Пауза' : 'Воспроизвести'}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          <button
            onClick={(e) => {
              e?.stopPropagation();
              onNext?.();
            }}
            aria-label="Следующий трек"
          >
            ⏭️
          </button>
        </div>

        <div className={style.progressContainer}>
          <span className={style.timeCurrent}>{formatTime(currentTime)}</span>
          <div
            className={style.progressBar}
            onClick={handleProgressClick}
            onKeyDown={handleProgressKeyDown}
            role="slider"
            aria-valuenow={Math.round(progress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            tabIndex={0}
          >
            <div
              className={style.progress}
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <span className={style.timeTotal}>{formatTime(duration)}</span>
        </div>
      </div>

      <div className={style.playerVolume}>
        <button
          onClick={(e) => {
            e?.stopPropagation();
            onToggleMute?.();
          }}
          aria-label={isMuted ? 'Включить звук' : 'Выключить звук'}
        >
          {isMuted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => {
            e?.stopPropagation();
            onVolumeChange?.(parseFloat(e.target.value));
          }}
          className={style.volumeSlider}
        />
        <button
          onClick={(e) => {
            e?.stopPropagation();
            onClose?.();
          }}
          aria-label="Закрыть плеер"
        >
          ✕
        </button>
      </div>

      <div className={style.extraControls}>
        <button
          className={`${style.extraButton} ${repeat === 'one' ? style.active : ''}`}
          onClick={(e) => {
            e?.stopPropagation();
            onSetRepeat?.(repeat === 'one' ? 'off' : 'one');
          }}
          aria-label={
            repeat === 'one' ? 'Отключить повтор одного' : 'Повторять один трек'
          }
        >
          🔁
        </button>

        <button
          className={`${style.extraButton} ${repeat === 'all' ? style.active : ''}`}
          onClick={(e) => {
            e?.stopPropagation();
            onSetRepeat?.(repeat === 'all' ? 'off' : 'all');
          }}
          aria-label={
            repeat === 'all' ? 'Отключить повтор всех' : 'Повторять все треки'
          }
        >
          🔂
        </button>

        <button
          className={`${style.extraButton} ${shuffle ? style.active : ''}`}
          onClick={(e) => {
            e?.stopPropagation();
            onToggleShuffle?.();
          }}
          aria-label={
            shuffle ? 'Отключить перемешивание' : 'Включить перемешивание'
          }
        >
          🔀
        </button>
      </div>
    </div>
  );
};
