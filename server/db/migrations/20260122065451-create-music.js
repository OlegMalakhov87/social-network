/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Music', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
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
        allowNull: false,
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      fileUrl: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      genre: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
      },
      isPublic: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      playCount: {
        type: Sequelize.INTEGER,
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
    await queryInterface.addIndex('Music', ['createdAt'], { order: 'DESC' });
    await queryInterface.addIndex('Music', ['genre']);
    await queryInterface.addIndex('Music', ['artist']);
    await queryInterface.addIndex('Music', ['isPublic']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Music');
  },
};
