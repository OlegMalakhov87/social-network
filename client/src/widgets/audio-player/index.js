export * from './model/audioPlayerSlice'; // экшены аудиоплеера
export { default as audioPlayerReducer } from './model/audioPlayerSlice'; // слайс аудиоплеера
export {
  AudioPlayerProvider,
  useAudioPlayer,
} from './provider/AudioPlayerProvider'; // провайдер аудиоплеера
export { AudioPlayer } from './ui/AudioPlayer'; // компонент аудиоплеера
export { AudioPlayerContainer } from './ui/AudioPlayerContainer'; // компонент контейнера аудиоплеера
