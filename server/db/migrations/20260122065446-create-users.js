/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      nickname: {
        type: Sequelize.STRING(25),
        unique: true,
      },
      name: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      age: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(35),
        allowNull: false,
        unique: true,
      },
      address: {
        type: Sequelize.TEXT,
      },
      job: {
        type: Sequelize.STRING(50),
      },
      status: {
        type: Sequelize.TEXT,
      },
      phone: {
        type: Sequelize.STRING(20),
        unique: true,
      },
      avatarUrl: {
        type: Sequelize.STRING(500),
      },
      visibility: {
        type: Sequelize.STRING(10),
        allowNull: false,
        validate: {
          isIn: [['public', 'friends', 'private']],
        },
      },
      passwordHash: {
        type: Sequelize.STRING(60),
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
    });

    await queryInterface.addIndex('Users', ['email']);
    await queryInterface.addIndex('Users', ['nickname']);
    await queryInterface.addIndex('Users', ['name']);
    await queryInterface.addIndex('Users', ['age']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  },
};
