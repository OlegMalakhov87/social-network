import { createSlice } from '@reduxjs/toolkit';

/**
 * Начальное состояние аудиоплеера.
 * @type {Object}
 */
const initialState = {
  currentTrack: null, // Текущий трек
  queue: [], // Очередь треков
  currentIndex: -1, // Индекс текущего трека в очереди
  repeat: 'off', // 'off' | 'one' | 'all' - повтор одного трека, всех треков или ничего
  shuffle: false, // Перемешивание очереди
  isPlaying: false, // Воспроизведение
  currentTime: 0, // Текущее время воспроизведения
  duration: 0, // Длительность текущего трека
  volume: 0.5, // Громкость
  isMuted: false, // Мут звука (включен/выключен)
  progress: 0, // Прогресс воспроизведения (в процентах)
  isLoading: false, // Загрузка (вкл/выкл)
  error: null, // Ошибка (текст ошибки или null)
};

/**
 * Сброс состояния воспроизведения.
 * @param {Object} state - текущее состояние
 */
const resetPlaybackState = (state) => {
  state.isPlaying = false;
  state.currentTime = 0;
  state.duration = 0;
  state.progress = 0;
  state.isLoading = false;
};

/**
 * Слайс аудиоплеера. Управляет состоянием воспроизведения, очередью, громкостью, повтором и перемешиванием музыки.
 * @name audioPlayerSlice
 */

const audioPlayerSlice = createSlice({
  name: 'audioPlayer',
  initialState,
  reducers: {
    /**
     * Установка очереди треков.
     * @param {Object} state - текущее состояние
     * @param {Object} action - действие
     */
    setQueue: (state, action) => {
      const { queue, currentIndex } = action.payload;
      state.queue = queue;
      state.currentIndex = currentIndex ?? (queue.length ? 0 : -1);
      state.currentTrack =
        state.currentIndex !== -1 ? state.queue[state.currentIndex] : null;
      resetPlaybackState(state);
      state.error = null;
    },
    /**
     * Переключение на следующий трек.
     * @param {Object} state - текущее состояние
     */
    nextTrack: (state) => {
      if (!state.queue.length) return;
      let nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.queue.length) {
        if (state.repeat === 'all') nextIndex = 0;
        else nextIndex = -1;
      }
      if (state.shuffle && state.queue.length > 1 && nextIndex !== -1) {
        let randomIndex;
        do {
          randomIndex = Math.floor(Math.random() * state.queue.length);
        } while (randomIndex === state.currentIndex && state.queue.length > 1);
        nextIndex = randomIndex;
      }
      if (nextIndex === -1) {
        state.currentTrack = null;
        state.currentIndex = -1;
        resetPlaybackState(state);
        return;
      }
      state.currentIndex = nextIndex;
      state.currentTrack = state.queue[nextIndex];
      state.currentTime = 0;
      state.duration = 0;
      state.progress = 0;
      state.error = null;
    },

    /**
     * Переключение на предыдущий трек.
     * @param {Object} state - текущее состояние
     */
    prevTrack: (state) => {
      if (!state.queue.length) return;
      let prevIndex = state.currentIndex - 1;
      if (prevIndex < 0) {
        if (state.repeat === 'all') prevIndex = state.queue.length - 1;
        else prevIndex = 0;
      }
      state.currentIndex = prevIndex;
      state.currentTrack = state.queue[prevIndex];
      state.currentTime = 0;
      state.duration = 0;
      state.progress = 0;
      state.error = null;
    },

    /**
     * Установка режима повтора.
     * @param {Object} state - текущее состояние
     * @param {Object} action - действие
     */
    setRepeat: (state, action) => {
      state.repeat = action.payload;
    },

    /**
     * Переключение режима перемешивания.
     * @param {Object} state - текущее состояние
     */
    toggleShuffle: (state) => {
      state.shuffle = !state.shuffle;
    },

    /**
     * Очистка плеера.
     * @param {Object} state - текущее состояние
     */
    clearPlayer: (state) => {
      state.currentTrack = null;
      state.queue = [];
      state.currentIndex = -1;
      resetPlaybackState(state);
      state.error = null;
    },

    /**
     * Синхронизация с DOM-событиями.
     * @param {Object} state - текущее состояние
     * @param {Object} action - действие
     */
    updatePlayerState: (state, action) => {
      const {
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        progress,
        isLoading,
        error,
      } = action.payload;
      if (isPlaying !== undefined) state.isPlaying = isPlaying;
      if (currentTime !== undefined) state.currentTime = currentTime;
      if (duration !== undefined) state.duration = duration;
      if (volume !== undefined) state.volume = volume;
      if (isMuted !== undefined) state.isMuted = isMuted;
      if (progress !== undefined) state.progress = progress;
      if (isLoading !== undefined) state.isLoading = isLoading;
      if (error !== undefined) state.error = error;
    },
  },
});

/**
 * Экшены слайса аудиоплеера.
 * @type {Object}
 */
export const {
  setQueue,
  nextTrack,
  prevTrack,
  setRepeat,
  toggleShuffle,
  clearPlayer,
  updatePlayerState,
} = audioPlayerSlice.actions;

export default audioPlayerSlice.reducer;
