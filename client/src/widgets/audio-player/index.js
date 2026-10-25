export * from './model/audioPlayerSlice'; // Содержит действия управления аудиоплеером.
export { default as audioPlayerReducer } from './model/audioPlayerSlice'; // Обновляет состояние аудиоплеера в Redux.
export {
  AudioPlayerProvider,
  useAudioPlayer,
} from './provider/AudioPlayerProvider'; // Предоставляет состояние и управление аудиоплеером.
export { AudioPlayer } from './ui/AudioPlayer'; // Отображает панель аудиоплеера.
export { AudioPlayerContainer } from './ui/AudioPlayerContainer'; // Связывает панель аудиоплеера с состоянием Redux.
