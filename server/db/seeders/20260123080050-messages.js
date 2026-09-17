/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Messages', [
      {
        senderId: 1,
        receiverId: 2,
        content: 'Привет! Как дела с новым дизайном?',
        isRead: true,
        isEdited: false,
        deletedBySender: false,
        deletedByReceiver: false,
      },
      {
        senderId: 2,
        receiverId: 1,
        content: 'Привет! Почти закончила, сегодня скину макеты',
        isRead: true,
        isEdited: false,
        deletedBySender: false,
        deletedByReceiver: false,
      },
      {
        senderId: 3,
        receiverId: 1,
        content: 'Алексей, привет! Есть минутка обсудить архитектуру БД?',
        isRead: true,
        isEdited: false,
        deletedBySender: false,
        deletedByReceiver: false,
      },
      {
        senderId: 1,
        receiverId: 3,
        content: 'Конечно, Дмитрий! В 15:00 подойдет?',
        isRead: false,
        isEdited: false,
        deletedBySender: false,
        deletedByReceiver: false,
      },
      {
        senderId: 5,
        receiverId: 8,
        content: 'Привет! Как дела?',
        isRead: true,
        isEdited: false,
        deletedBySender: false,
        deletedByReceiver: false,
      },
      {
        senderId: 8,
        receiverId: 5,
        content: 'Привет! Все хорошо, спасибо! Как у тебя?',
        isRead: true,
        isEdited: false,
        deletedBySender: false,
        deletedByReceiver: false,
      },
      {
        senderId: 5,
        receiverId: 8,
        content: 'Неплохо, устроилась на работу в IT компанию',
        isRead: true,
        isEdited: false,
        deletedBySender: false,
        deletedByReceiver: false,
      },
      {
        senderId: 8,
        receiverId: 5,
        content:
          'Поздравляю. У меня тоже все хорошо. Сейчас заканчиваю свой проект',
        isRead: false,
        isEdited: false,
        deletedBySender: false,
        deletedByReceiver: false,
      },
      {
        senderId: 2,
        receiverId: 8,
        content: 'Привет, как дела? Чем занимаешься, не забыл про проект?',
        isRead: true,
        isEdited: false,
        deletedBySender: false,
        deletedByReceiver: false,
      },
      {
        senderId: 8,
        receiverId: 2,
        content:
          'Привет, нормально. Конечно не забыл, думал, что получится закончить раньше, но увы. Как у тебя дела?',
        isRead: false,
        isEdited: false,
        deletedBySender: false,
        deletedByReceiver: false,
      },
      {
        senderId: 7,
        receiverId: 8,
        content: 'Привет, давно не виделись. У меня хорошие новости для тебя',
        isRead: false,
        isEdited: false,
        deletedBySender: false,
        deletedByReceiver: false,
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Messages', null, {});
  },
};
