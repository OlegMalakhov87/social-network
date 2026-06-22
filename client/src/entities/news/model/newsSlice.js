import { createSlice } from '@reduxjs/toolkit';

const newsSlice = createSlice({
  name: 'news',
  initialState: {
    newsData: [
      {
        id: 1,
        title: 'Новые технологии в медицине',
        content:
          'Ученые разработали революционный метод лечения онкологических заболеваний с использованием нанороботов.',
        date: '2025-01-17',
        author: 'Елена Малышева',
        category: 'Technology',
        source: 'Медицинский эксперт',
        imageUrl: 'https://picsum.photos/320/180?random=8',
        viewCount: 10170,
      },
      {
        id: 2,
        title: 'Изменения в налоговом законодательстве',
        content:
          'С нового года вступают в силу поправки, предусматривающие льготы для малого и среднего бизнеса.',
        date: '2025-02-12',
        author: 'Герман Ворошилов',
        category: 'Economy',
        source: 'Экономический обозреватель',
        imageUrl: 'https://picsum.photos/320/180?random=18',
        viewCount: 1060,
      },
      {
        id: 3,
        title: 'Климатический саммит в Париже',
        content:
          'Лидеры стран договорились о сокращении выбросов углекислого газа на 30% к 2030 году.',
        date: '2025-03-21',
        author: 'Евгений Усачев',
        category: 'Health',
        source: 'Экологический корреспондент',
        imageUrl: 'https://picsum.photos/320/180?random=17',
        viewCount: 11150,
      },
      {
        id: 4,
        title: 'Открытие нового культурного центра',
        content:
          'В центре Москвы открылся современный арт-пространство с выставочными залами и мастерскими.',
        date: '2025-04-24',
        author: 'Анжелика Ворум',
        category: 'Culture',
        source: 'Культурный обозреватель',
        imageUrl: 'https://picsum.photos/320/180?random=10',
        viewCount: 1560505,
      },
      {
        id: 5,
        title: 'Прорыв в космической отрасли',
        content:
          'Частная компания успешно запустила многоразовую ракету для доставки грузов на орбиту.',
        date: '2025-05-23',
        author: 'Илон Маск',
        category: 'Technology',
        source: 'Космический аналитик',
        imageUrl: 'https://picsum.photos/320/180?random=42',
        viewCount: 8235,
      },
      {
        id: 6,
        title: 'Российские теннисисты вышли в финал Кубка Дэвиса',
        content:
          'Сборная России по теннису обыграла команду Германии со счетом 3-1 в полуфинале Кубка Дэвиса.  Решающее очко принес Даниил Медведев, обыгравший Александра Зверева.  В финале россияне встретятся с действующими чемпионами - сборной Италии.',
        date: '2025-06-07',
        author: 'Мария Орзул',
        category: 'Sports',
        source: 'Спорт экспресс',
        imageUrl: 'https://picsum.photos/320/180?random=22',
        viewCount: 5620,
      },
      {
        id: 7,
        title: 'Сборная России по футболу снова вылетела из чемпионата Европы',
        content:
          'Сборная России вылетела из чемпионата Европы по футболу проиграв сборной Греции со счетом 1:6. По итогу команда сборной России не выиграла ни одного матча на чемпионате. Главный тренер все вину взял на себя',
        date: '2025-07-06',
        author: 'Владимир Стогниенко',
        category: 'Sports',
        source: 'Новости спорта',
        imageUrl: 'https://picsum.photos/320/180?random=39',
        viewCount: 3110,
      },
      {
        id: 8,
        title: 'SpaceX успешно запустила Starship в пятый испытательный полет',
        content:
          'Компания Илона Маска SpaceX провела пятый испытательный запуск космического корабля Starship. В отличие от предыдущих попыток, прототип успешно совершил мягкую посадку в Индийском океане. Это открывает новые перспективы для лунной программы NASA и будущих миссий на Марс.',
        date: '2025-08-09',
        author: 'Юрий Смирнов',
        category: 'Technology',
        source: 'IT индустрия',
        imageUrl: 'https://picsum.photos/320/180?random=29',
        viewCount: 4210,
      },
      {
        id: 9,
        title: 'Рубль укрепился после переговоров по нефти',
        content:
          'Российская валюта показала рост на 2.5% по отношению к доллару после успешных переговоров стран ОПЕК+. Эксперты связывают укрепление с договоренностью о сокращении добычи нефти и стабилизацией цен на энергоносители. Аналитики прогнозируют сохранение тренда в ближайшие месяцы.',
        date: '2025-08-16',
        author: 'Семен Фарада',
        category: 'Economy',
        source: 'Никольское кольцо',
        imageUrl: 'https://picsum.photos/320/180?random=19',
        viewCount: 1220,
      },
      {
        id: 10,
        title: 'Ученые нашли новый способ лечения диабета 1 типа',
        content:
          'Исследователи из Сеченовского университета разработали метод лечения диабета 1 типа с использованием стволовых клеток. Технология позволяет восстанавливать бета-клетки поджелудочной железы, отвечающие за выработку инсулина. Клинические испытания начнутся в конце 2026 года.',
        date: '2025-09-19',
        author: 'Алексей Мясников',
        category: 'Health',
        source: 'Доктор Живаго',
        imageUrl: 'https://picsum.photos/320/180?random=11',
        viewCount: 3130,
      },
      {
        id: 11,
        title: 'В Москве открылся международный кинофестиваль',
        content:
          '43-й Московский международный кинофестиваль открылся премьерой нового фильма Никиты Михалкова. В конкурсной программе участвуют 15 картин из России, Франции, Китая и Ирана. Специальным гостем фестиваля стал Квентин Тарантино, который представит ретроспективу своих фильмов.',
        date: '2025-10-29',
        author: 'Елена Ряченская',
        category: 'Culture',
        source: 'Культурная столица',
        imageUrl: 'https://picsum.photos/320/180?random=9',
        viewCount: 1630,
      },
      {
        id: 12,
        title: 'ИИ создает музыку неотличимую от человеческой',
        content: 'Нейросети GPT-4 научились генерировать музыкальные композиции...',
        date: '2025-11-03',
        author: 'Иван Петров',
        category: 'Technology',
        source: 'Технологии будущего',
        imageUrl: 'https://picsum.photos/320/180?random=7',
        viewCount: 2210,
      },
    ],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    addNews: (state, action) => {
      const { formData } = action.payload;
      const newId =
        state.newsData.length > 0 ? Math.max(...state.newsData.map((n) => n.id)) + 1 : 1;
      const newNews = {
        id: newId,
        title: formData.title,
        content: formData.content,
        author: formData.author,
        category: formData.category,
        source: formData.source,
        imageUrl: formData.imageUrl,
        viewCount: 0,
        date: new Date().toISOString(),
      };
      state.newsData.push(newNews);
    },

    deleteNews: (state, action) => {
      const { currentUser, newsId } = action.payload;
      const news = state.newsData.find((n) => n.id === newsId);
      if (news && currentUser.isAdmin) {
        state.newsData = state.newsData.filter((n) => n.id !== newsId);
      }
    },
  },
});
export const { addNews, deleteNews } = newsSlice.actions;

export default newsSlice.reducer;
