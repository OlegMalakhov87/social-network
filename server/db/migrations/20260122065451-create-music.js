/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Music', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      uploadedBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      title: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      artist: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      album: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      audioUrl: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      coverUrl: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      isPublic: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      playsCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
    await queryInterface.addIndex('Music', ['uploadedBy']);
    await queryInterface.addIndex('Music', ['createdAt']);
    await queryInterface.addIndex('Music', ['title']);
    await queryInterface.addIndex('Music', ['category']);
    await queryInterface.addIndex('Music', ['artist']);
    await queryInterface.addIndex('Music', ['isPublic']);
    await queryInterface.addIndex('Music', ['playsCount']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Music');
  },
};
