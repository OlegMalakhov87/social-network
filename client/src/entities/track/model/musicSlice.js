import { createSlice } from '@reduxjs/toolkit';

const musicSlice = createSlice({
  name: 'music',
  initialState: {
    musicData: [
      {
        uploadedBy: 7,
        title: 'Bohemian Rhapsody',
        artist: 'Queen',
        album: 'A Night at the Opera',
        year: 1975,
        duration: 355,
        fileUrl: 'https://sample-files.com/downloads/audio/mp3/silence-5sec-32kbps.mp3',
        genre: 'Rock',
        description: 'Легендарная песня',
        isPublic: true,
        playCount: 175,
      },
      {
        uploadedBy: 3,
        title: 'Imagine',
        artist: 'John Lennon',
        album: 'Imagine',
        year: 1971,
        duration: 185,
        fileUrl: 'https://sample-files.com/downloads/audio/mp3/tone-test.mp3',
        genre: 'Pop',
        description: 'Философская баллада о мире и гармонии',
        isPublic: true,
        playCount: 245,
      },
      {
        uploadedBy: 5,
        title: 'Take Five',
        artist: 'Dave Brubeck Quartet',
        album: 'Time Out',
        year: 1959,
        duration: 323,
        fileUrl: 'https://sample-files.com/downloads/audio/mp3/voice-sample.mp3',
        genre: 'Jazz',
        description: 'Инструментальный джазовый шедевр в размере 5/4',
        isPublic: true,
        playCount: 189,
      },
      {
        uploadedBy: 2,
        title: 'Billie Jean',
        artist: 'Michael Jackson',
        album: 'Thriller',
        year: 1982,
        duration: 330,
        fileUrl: 'https://sample-files.com/downloads/audio/mp3/low-bitrate-32kbps.mp3',
        genre: 'Pop',
        description: 'Иконический трек короля поп-музыки',
        isPublic: true,
        playCount: 412,
      },
      {
        uploadedBy: 9,
        title: 'Smells Like Teen Spirit',
        artist: 'Nirvana',
        album: 'Nevermind',
        year: 1991,
        duration: 302,
        fileUrl: 'https://sample-files.com/downloads/audio/mp3/sfx-compilation.mp3',
        genre: 'Rock',
        description: 'Гимн поколения 90-х',
        isPublic: true,
        playCount: 378,
      },
      {
        uploadedBy: 4,
        title: 'Clair de Lune',
        artist: 'Claude Debussy',
        album: 'Suite bergamasque',
        year: 1905,
        duration: 247,
        fileUrl: 'https://dl2.mp3party.net/online/8941370.mp3',
        genre: 'Classical',
        description: 'Вечная классика французского импрессионизма',
        isPublic: true,
        playCount: 156,
      },
      {
        uploadedBy: 7,
        title: 'Lose Yourself',
        artist: 'Eminem',
        album: '8 Mile Soundtrack',
        year: 2002,
        duration: 283,
        fileUrl: 'https://sample-files.com/downloads/audio/mp3/music-sample-128kbps.mp3',
        genre: 'Hip-Hop',
        description: 'Мотивирующий трек из фильма 8 Миль',
        isPublic: true,
        playCount: 328,
      },
      {
        uploadedBy: 11,
        title: 'Stairway to Heaven',
        artist: 'Led Zeppelin',
        album: 'Led Zeppelin IV',
        year: 1971,
        duration: 654,
        fileUrl: '	https://sample-files.com/downloads/audio/mp3/music-sample-320kbps.mp3',
        genre: 'Rock',
        description: 'Эпическая рок-баллада с культовым гитарным соло',
        isPublic: false,
        playCount: 321,
      },
      {
        uploadedBy: 6,
        title: 'Blinding Lights',
        artist: 'The Weeknd',
        album: 'After Hours',
        year: 2020,
        duration: 198,
        fileUrl: '	https://sample-files.com/downloads/audio/mp3/music-sample-vbr.mp3',
        genre: 'Pop',
        description: 'Ретро-синтпоп хит с ностальгическим звучанием 80-х',
        isPublic: true,
        playCount: 523,
      },
      {
        uploadedBy: 8,
        title: 'Hotel California',
        artist: 'Eagles',
        album: 'Hotel California',
        year: 1976,
        duration: 376,
        fileUrl: 'https://sample-files.com/downloads/audio/mp3/long-audio-5min.mp3',
        genre: 'Rock',
        description: 'Легендарная песня о калифорнийской мечте',
        isPublic: true,
        playCount: 289,
      },
    ],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    addTrack: (state, action) => {
      const { currentUserId, formData } = action.payload;
      const newId =
        state.musicData.length > 0 ? Math.max(...state.musicData.map((t) => t.id)) + 1 : 1;
      const newMusic = {
        id: newId,
        uploadedBy: currentUserId,
        title: formData.title,
        artist: formData.artist,
        album: formData.album,
        year: new Date().getFullYear(),
        duration: 210,
        fileUrl: formData.fileUrl,
        genre: formData.genre,
        description: formData.description,
        category: formData.category,
        isPublic: formData.isPublic,
        playCount: 0,
        date: new Date().toISOString(),
      };
      state.musicData.push(newMusic);
    },

    deleteTrack: (state, action) => {
      const { currentUser, trackId } = action.payload;
      const track = state.musicData.find((t) => t.id === trackId);
      if ((track && track.uploadedBy === currentUser.id) || currentUser.isAdmin) {
        state.musicData = state.musicData.filter((t) => t.id !== trackId);
      }
    },
  },
});

export const { addTrack, deleteTrack } = musicSlice.actions;

export default musicSlice.reducer;
