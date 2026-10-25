import { IconButton, Image } from '../../../shared/ui';

import style from './AudioPlayer.module.css';

/**
 * Отображает панель аудиоплеера.
 *
 * @param {Object} props - Свойства компонента
 * @param {Object|null} props.currentTrack - Текущий трек
 * @param {boolean} props.isPlaying - Признак воспроизведения текущего трека
 * @param {number} props.volume - Громкость от 0 до 1
 * @param {boolean} props.isMuted - Признак отключённого звука
 * @param {number} props.progress - Доля воспроизведения от 0 до 1
 * @param {number} props.currentTime - Текущая позиция в секундах
 * @param {number} props.duration - Длительность трека в секундах
 * @param {Function} props.formatTime - Форматирование времени
 * @param {boolean} props.isLoading - Признак загрузки трека
 * @param {string|null} props.error - Текст ошибки воспроизведения
 * @param {Function} [props.onTogglePlay] - Обработчик паузы и воспроизведения
 * @param {Function} [props.onSeekPercent] - Обработчик перемотки
 * @param {Function} [props.onNext] - Обработчик перехода к следующему треку
 * @param {Function} [props.onPrev] - Обработчик перехода к предыдущему треку
 * @param {Function} [props.onSetRepeat] - Обработчик смены режима повтора
 * @param {Function} [props.onToggleShuffle] - Обработчик перемешивания очереди
 * @param {Function} [props.onVolumeChange] - Обработчик изменения громкости
 * @param {Function} [props.onToggleMute] - Обработчик включения и отключения звука
 * @param {Function} [props.onClose] - Обработчик закрытия плеера
 * @param {string} props.repeat - Режим повтора: off, one или all
 * @param {boolean} props.shuffle - Признак перемешивания очереди
 * @returns {JSX.Element|null} Разметка плеера.
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
  /**
   * Останавливает всплытие и вызывает переданный обработчик.
   *
   * @param {Function} handler - Обработчик действия
   * @returns {Function} Обработчик нажатия.
   */
  const handleAction = (handler) => (e) => {
    e?.stopPropagation();
    handler?.();
  };

  /**
   * Перематывает воспроизведение по положению ползунка.
   *
   * @param {Object} e - Событие изменения ползунка
   */
  const handleProgressChange = (e) => {
    e?.stopPropagation();
    const nextPercent = Number(e.target.value) / 100;
    // Ограничивает позицию диапазоном от 0 до 1.
    onSeekPercent?.(Math.max(0, Math.min(1, nextPercent)));
  };

  /**
   * Меняет громкость по положению ползунка.
   *
   * @param {Object} e - Событие изменения ползунка
   */
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
          fallback={'/no-cover-150x150.png'}
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
