/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Posts', [
      {
        userId: 1,
        message: 'Сегодня завершил большой проект! Очень доволен результатом. #успех #работа',
        mediaUrl: 'https://picsum.photos/800/600?random=30',
        visibility: 'public',
        postType: 'image',
      },
      {
        userId: 2,
        message: 'Ищу вдохновение для нового дизайна. Какие тренды в UI сейчас актуальны?',
        mediaUrl: '',
        visibility: 'public',
        postType: 'text',
      },
      {
        userId: 3,
        message: 'Поделюсь кодом оптимизации запросов к PostgreSQL...',
        mediaUrl: '',
        visibility: 'friends',
        postType: 'text',
      },
      {
        userId: 4,
        message:
          '- Выучить JS ? - Да легко! Можете меня поздравить, это было нечто. Это почти как пройти афганскую войну.',
        mediaUrl: '',
        visibility: 'friends',
        postType: 'text',
      },
      {
        userId: 5,
        message: 'Ссылку на материалы прилагаю https://doka.guide не благодарите.',
        mediaUrl: '',
        visibility: 'friends',
        postType: 'text',
      },
      {
        userId: 6,
        message: 'Это мой приватный пост, который вижу только я и никто другой.',
        mediaUrl: 'https://picsum.photos/800/600?random=31',
        visibility: 'private',
        postType: 'image',
      },
      {
        userId: 7,
        message: 'Обучающее видео - как я выучил JavaScript за 10 минут.',
        mediaUrl: 'https://www.w3schools.com/html/movie.mp4',
        visibility: 'public',
        postType: 'video',
      },
      {
        userId: 8,
        message: 'Красивое фото из Грузии.',
        mediaUrl: 'https://picsum.photos/800/600?random=32',
        visibility: 'friends',
        postType: 'image',
      },
      {
        userId: 9,
        message: 'Мое первое фото',
        mediaUrl: 'https://picsum.photos/800/600?random=33',
        visibility: 'friends',
        postType: 'image',
      },
      {
        userId: 10,
        message: 'Поздравьте меня с днем рождения! Сегодня отличная погода - как мне повезло!',
        mediaUrl: '',
        visibility: 'public',
        postType: 'text',
      },
      {
        userId: 11,
        message:
          'Я выучила React и устроилась на работу. Теперь я работаю 24/7. Это приватный пост',
        mediaUrl: '',
        visibility: 'private',
        postType: 'text',
      },
      {
        userId: 12,
        message: 'Ссылка на интересный ресурс https://doka.guide/js',
        mediaUrl: '',
        visibility: 'public',
        postType: 'text',
      },
      {
        userId: 13,
        message: 'Видео с уроком',
        mediaUrl: 'https://samplelib.com/mp4/sample-10s.mp4',
        visibility: 'friends',
        postType: 'video',
      },
      {
        userId: 14,
        message: 'Фото из путешествия',
        mediaUrl: 'https://picsum.photos/800/600?random=34',
        visibility: 'public',
        postType: 'image',
      },
      {
        userId: 15,
        message: 'Ребята продаю машину в отличном состоянии.',
        mediaUrl: '',
        visibility: 'public',
        postType: 'text',
      },

      {
        userId: 16,
        message:
          'Ребята, копируйте ссылку пока не пропала https://doka.guide/js/expressions-vs-statements',
        mediaUrl: '',
        visibility: 'friends',
        postType: 'text',
      },
      {
        userId: 17,
        message: 'Сегодня Redux Toolkit! Жду поздравлений.',
        mediaUrl: '',
        visibility: 'public',
        postType: 'text',
      },
      {
        userId: 18,
        message: 'Когда же это уже все закончится? Программисты?!.',
        mediaUrl: '',
        visibility: 'public',
        postType: 'text',
      },
      {
        userId: 1,
        message: 'Какой сегодня чудесный день!',
        mediaUrl: '',
        visibility: 'public',
        postType: 'text',
      },
      {
        userId: 2,
        message: 'Какой сериал посоветуете посмотреть? Что последнее Вам понравилось?',
        mediaUrl: '',
        visibility: 'public',
        postType: 'text',
      },
      {
        userId: 3,
        message: 'Поздравляю всех с началом лета, оно будет прекрасным.',
        mediaUrl: '',
        visibility: 'public',
        postType: 'text',
      },
      {
        userId: 4,
        message: 'Поздравляю Вас с прошедшими майскими праздникам, всем добра и мира!',
        mediaUrl: '',
        visibility: 'public',
        postType: 'text',
      },
      {
        userId: 5,
        message: 'Скоро отпуск! Ура! Уже взяли билеты в Сочи, Красная Поляна ждет нас.',
        mediaUrl: '',
        visibility: 'public',
        postType: 'text',
      },
      {
        userId: 6,
        message:
          'Пора бы уже и мне найти работу. Ребята как у Вас сейчас дела с работой, долго искали?',
        mediaUrl: '',
        visibility: 'friends',
        postType: 'text',
      },
      {
        userId: 7,
        message: 'Сегодня освоен React Router. Завтра начну Redux и так выучу React.',
        mediaUrl: '',
        visibility: 'public',
        postType: 'text',
      },
      {
        userId: 8,
        message: 'Скоро экзамен по истории России, пожелайте мне удачи!.',
        mediaUrl: '',
        visibility: 'private',
        postType: 'text',
      },
      {
        userId: 9,
        message:
          'Учимся программировать. Подписываемся на мой канал в YouTube и Telegram! Ссылку оставлю в комментариях.',
        mediaUrl: '',
        visibility: 'public',
        postType: 'text',
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Posts', null, {});
  },
};
