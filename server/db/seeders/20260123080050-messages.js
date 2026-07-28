/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Messages', [
      {
        senderId: 1,
        receiverId: 2,
        content: 'Привет! Как дела с новым дизайном?',
        isRead: true,
        deletedBySender: false,
        deletedByReceiver: false,
      },
      {
        senderId: 2,
        receiverId: 1,
        content: 'Привет! Почти закончила, сегодня скину макеты',
        isRead: true,
        deletedBySender: false,
        deletedByReceiver: false,
      },
      {
        senderId: 3,
        receiverId: 1,
        content: 'Алексей, привет! Есть минутка обсудить архитектуру БД?',
        isRead: true,
        deletedBySender: false,
        deletedByReceiver: false,
      },
      {
        senderId: 1,
        receiverId: 3,
        content: 'Конечно, Дмитрий! В 15:00 подойдет?',
        isRead: false,
        deletedBySender: false,
        deletedByReceiver: false,
      },
      {
        senderId: 5,
        receiverId: 8,
        content: 'Привет! Давно не общались. Как у тебя с работой?',
        isRead: true,
        deletedBySender: false,
        deletedByReceiver: false,
      },
      {
        senderId: 8,
        receiverId: 5,
        content:
          'Привет, да, очень давно. Извини, я весь в запарках, учу JS. Как у тебя дела?',
        isRead: true,
        deletedBySender: false,
        deletedByReceiver: false,
      },
      {
        senderId: 5,
        receiverId: 8,
        content: 'Все хорошо, работаю в Яндекс',
        isRead: true,
        deletedBySender: false,
        deletedByReceiver: false,
      },
      {
        senderId: 8,
        receiverId: 5,
        content:
          'Поздравляю. У меня тоже все хорошо. Сейчас заканчиваю свой проект',
        isRead: false,
        deletedBySender: false,
        deletedByReceiver: false,
      },
      {
        senderId: 2,
        receiverId: 8,
        content: 'Чем занимаешься сейчас? Закончил свой проект?',
        isRead: true,
        deletedBySender: false,
        deletedByReceiver: false,
      },
      {
        senderId: 8,
        receiverId: 2,
        content: 'Пока нет. Думал, что получится закончить раньше, но увы.',
        isRead: false,
        deletedBySender: false,
        deletedByReceiver: false,
      },
      {
        senderId: 7,
        receiverId: 8,
        content: 'Привет, давно не виделись, чем занимаешься?',
        isRead: false,
        deletedBySender: false,
        deletedByReceiver: false,
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Messages', null, {});
  },
};
