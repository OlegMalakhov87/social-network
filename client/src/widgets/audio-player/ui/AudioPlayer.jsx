import { IconButton, Image } from '../../../shared/ui';
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
  /** Обработчик действий (нажатий кнопок) */
  const handleAction = (handler) => (e) => {
    e?.stopPropagation();
    handler?.();
  };

  /** Обработчик изменения прогресса воспроизведения */
  const handleProgressChange = (e) => {
    e?.stopPropagation();
    const nextPercent = Number(e.target.value) / 100;
    onSeekPercent?.(Math.max(0, Math.min(1, nextPercent)));
  };

  /** Обработчик изменения громкости */
  const handleVolumeChange = (e) => {
    e?.stopPropagation();
    onVolumeChange?.(parseFloat(e.target.value));
  };

  if (!currentTrack?.audioUrl) return null;

  return (
    <div className={style.playerBar}>
      {error && <div className={style.errorToast}>{error}</div>}

      <div className={style.playerInfo}>
        <Image
          src={currentTrack.coverUrl}
          alt={currentTrack.title}
          width={50}
          height={50}
          className={style.playerCover}
        />
        <div className={style.trackDetails}>
          <div className={style.playerTrack}>{currentTrack.title}</div>
          <div className={style.playerArtist}>{currentTrack.artist}</div>
          {isLoading && <span className={style.loadingText}>Загрузка...</span>}
        </div>
      </div>

      <div className={style.playerControls}>
        <div className={style.controlButtons}>
          <IconButton
            icon="⏮️"
            variant="ghost"
            size="md"
            onClick={handleAction(onPrev)}
            ariaLabel="Предыдущий трек"
          />
          <IconButton
            icon={isPlaying ? '⏸️' : '▶️'}
            variant="primary"
            size="md"
            onClick={handleAction(onTogglePlay)}
            ariaLabel={isPlaying ? 'Пауза' : 'Воспроизвести'}
            className={style.playButton}
          />
          <IconButton
            icon="⏭️"
            variant="ghost"
            size="md"
            onClick={handleAction(onNext)}
            ariaLabel="Следующий трек"
          />
        </div>

        <div className={style.progressContainer}>
          <span className={style.timeCurrent}>{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={100}
            step={0.5}
            value={Math.round(progress * 100)}
            onChange={handleProgressChange}
            className={style.progressSlider}
            aria-label="Прогресс воспроизведения"
          />
          <span className={style.timeTotal}>{formatTime(duration)}</span>
        </div>
      </div>

      <div className={style.playerVolume}>
        <IconButton
          icon={isMuted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
          variant="ghost"
          size="sm"
          onClick={handleAction(onToggleMute)}
          ariaLabel={isMuted ? 'Включить звук' : 'Выключить звук'}
        />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className={style.volumeSlider}
          aria-label="Громкость"
        />
        <IconButton
          icon="✕"
          variant="ghost"
          size="sm"
          onClick={handleAction(onClose)}
          ariaLabel="Закрыть плеер"
        />
      </div>

      <div className={style.extraControls}>
        <IconButton
          icon="🔁"
          variant="ghost"
          size="sm"
          className={`${style.extraButton} ${repeat === 'one' ? style.active : ''}`}
          onClick={handleAction(() =>
            onSetRepeat?.(repeat === 'one' ? 'off' : 'one')
          )}
          ariaLabel={
            repeat === 'one' ? 'Отключить повтор одного' : 'Повторять один трек'
          }
        />

        <IconButton
          icon="🔂"
          variant="ghost"
          size="sm"
          className={`${style.extraButton} ${repeat === 'all' ? style.active : ''}`}
          onClick={handleAction(() =>
            onSetRepeat?.(repeat === 'all' ? 'off' : 'all')
          )}
          ariaLabel={
            repeat === 'all' ? 'Отключить повтор всех' : 'Повторять все треки'
          }
        />

        <IconButton
          icon="🔀"
          variant="ghost"
          size="sm"
          className={`${style.extraButton} ${shuffle ? style.active : ''}`}
          onClick={handleAction(onToggleShuffle)}
          ariaLabel={
            shuffle ? 'Отключить перемешивание' : 'Включить перемешивание'
          }
        />
      </div>
    </div>
  );
};
