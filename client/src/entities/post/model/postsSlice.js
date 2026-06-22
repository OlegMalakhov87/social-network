import { createSlice } from '@reduxjs/toolkit';

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    postsData: [
      {
        id: 1,
        userId: 2,
        text: 'Можете меня поздравить, я выучила Redux! Это было нечто. Это почти как пройти афганскую войну.',
        photoUrl: '',
        visibility: 'public',
        postType: 'text',
        date: '2024-11-09',
      },
      {
        id: 2,
        userId: 1,
        text: 'Я выучил TypeScript и теперь я готов на все. Ссылку на материалы прилагаю, не благодарите.',
        photoUrl: '',
        visibility: 'friends',
        postType: 'link',
        date: '2025-02-10',
      },
      {
        id: 3,
        userId: 4,
        text: '',
        photoUrl: 'https://picsum.photos/320/180?random=36',
        visibility: 'private',
        postType: 'image',
        date: '2025-11-13',
      },
      {
        id: 4,
        userId: 5,
        text: 'Обучающее видео - как я выучил JavaScript за 10 минут.',
        photoUrl: 'https://picsum.videos/320/180?random=35',
        visibility: 'public',
        postType: 'video',
        date: '2026-02-19',
      },
      {
        id: 5,
        userId: 4,
        text: '',
        photoUrl: 'https://picsum.photos/320/180?random=37',
        visibility: 'friends',
        postType: 'image',
        date: '2026-01-19',
      },
      {
        id: 6,
        userId: 8,
        text: 'Мое первое фото',
        photoUrl: 'https://picsum.photos/320/180?random=40',
        visibility: 'friends',
        postType: 'image',
        date: '2026-02-22',
      },
      {
        id: 7,
        userId: 11,
        visibility: 'public',
        postType: 'text',
        text: 'Поздравьте меня с днем рождения! Сегодня отличная погода - как мне повезло!',
        photoUrl: '',
        date: '2026-03-23',
      },
      {
        id: 9,
        userId: 10,
        text: 'Я выучила React и устроилась на работу. Теперь я работаю 24/7. Это приватный пост',
        photoUrl: '',
        visibility: 'private',
        postType: 'text',
        date: '2026-03-03',
      },
      {
        id: 10,
        userId: 3,
        text: 'Ссылка на интересный ресурс',
        photoUrl: '',
        visibility: 'public',
        postType: 'link',
        date: '2026-01-24',
      },
      {
        id: 11,
        userId: 1,
        text: 'Видео с уроком',
        photoUrl: 'https://picsum.videos/320/180?random=39',
        visibility: 'friends',
        postType: 'video',
        date: '2024-03-24',
      },
      {
        id: 12,
        userId: 2,
        text: 'Фото с путешествия',
        photoUrl: 'https://picsum.photos/320/180?random=38',
        visibility: 'public',
        postType: 'image',
        date: '2025-06-14',
      },
      {
        id: 13,
        userId: 3,
        text: 'Ребята продаю машину в хорошем состоянии! Приезжайте - смотрите.',
        photoUrl: '',
        visibility: 'public',
        postType: 'text',
        date: '2025-07-13',
      },

      {
        id: 14,
        userId: 5,
        text: 'Ребята, копируйте ссылку пока не пропала',
        photoUrl: '',
        visibility: 'public',
        postType: 'link',
        date: '2025-07-13',
      },
      {
        id: 15,
        userId: 7,
        text: 'Сегодня я выучила Redux Toolkit! Жду поздравлений.',
        photoUrl: '',
        visibility: 'public',
        postType: 'text',
        date: '2025-09-09',
      },
      {
        id: 16,
        userId: 6,
        text: 'Когда же это уже все закончится? Зачем я стала программистом.',
        photoUrl: '',
        visibility: 'public',
        postType: 'text',
        date: '2025-09-09',
      },
      {
        id: 17,
        userId: 12,
        text: 'Какой сегодня чудесный день! Я такая счастливая.',
        photoUrl: '',
        visibility: 'public',
        postType: 'text',
        date: '2025-09-09',
      },
      {
        id: 18,
        userId: 9,
        text: 'Какой сериал посоветуете посмотреть? Последнее что понравилось, это сериал "Во все тяжкие"',
        photoUrl: '',
        visibility: 'public',
        postType: 'text',
        date: '2025-10-16',
      },
      {
        id: 19,
        userId: 5,
        text: 'Скоро новый год! Всех поздравляю и желаю счастья.',
        photoUrl: '',
        visibility: 'public',
        postType: 'text',
        date: '2025-12-10',
      },
      {
        id: 20,
        userId: 10,
        text: 'С Новым Годом друзья! Поздравляю Вас, всем добра!',
        photoUrl: '',
        visibility: 'public',
        postType: 'text',
        date: '2025-12-31',
      },
      {
        id: 21,
        userId: 11,
        text: 'Скоро каникулы! Ура! Уже взял билеты Сочи, Красная Поляна ждет меня.',
        photoUrl: '',
        visibility: 'public',
        postType: 'text',
        date: '2026-02-10',
      },
      {
        id: 22,
        userId: 12,
        text: 'Пора бы уже и мне найти работу. Как у Вас дела с работой, долго искали?',
        photoUrl: '',
        visibility: 'public',
        postType: 'text',
        date: '2026-02-10',
      },
      {
        id: 23,
        userId: 13,
        text: 'Сегодня я выучила React Router. Завтра начну Redux и так маленькими шажочками выучу React.',
        photoUrl: '',
        visibility: 'public',
        postType: 'text',
        date: '2026-01-24',
      },
      {
        id: 24,
        userId: 14,
        text: 'Скоро экзамен по истории, думаю сдам на 5, так как очень долго готовился.',
        photoUrl: '',
        visibility: 'public',
        postType: 'text',
        date: '2026-01-10',
      },
      {
        id: 25,
        userId: 15,
        text: 'Учимся программировать. Анушка все сюда!',
        photoUrl: '',
        visibility: 'public',
        postType: 'text',
        date: '2026-02-10',
      },
    ],
    newPostText: '',
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    addPost: (state, action) => {
      const { newPostText, currentUserId } = action.payload;
      const newId =
        state.postsData.length > 0 ? Math.max(...state.postsData.map((p) => p.id)) + 1 : 1;
      const newPost = {
        id: newId,
        userId: currentUserId,
        visibility: 'public',
        type: 'text',
        text: newPostText,
        date: new Date().toISOString(),
      };
      state.postsData.push(newPost);
      state.newPostText = '';
    },
    deletePost: (state, action) => {
      const { postId, currentUserId } = action.payload;
      const userPost = state.postsData.find(
        (post) => post.id === postId && post.userId === currentUserId
      );
      if (!userPost) return;
      state.postsData = state.postsData.filter((post) => post.id !== userPost.id);
    },
    updateVisibilityPost: (state, actions) => {
      const { postId, currentUserId, visibility } = actions.payload;
      const userPost = state.postsData.find(
        (post) => post.id === postId && post.userId === currentUserId
      );
      if (userPost) {
        state.postsData = state.postsData.map((p) =>
          p.id === userPost.id ? { ...p, visibility: visibility } : p
        );
      }
    },

    updateNewPostText: (state, action) => {
      state.newPostText = action.payload;
    },
  },
});

export const { addPost, deletePost, updateNewPostText, updateVisibilityPost } = postsSlice.actions;

export default postsSlice.reducer;
