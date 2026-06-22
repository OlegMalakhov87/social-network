/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Videos', {
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
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      size: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      videoUrl: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      thumbnailUrl: {
        type: Sequelize.STRING(500),
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      isPublic: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      viewCount: {
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
    await queryInterface.addIndex('Videos', ['uploadedBy']);
    await queryInterface.addIndex('Videos', ['createdAt'], { order: 'DESC' });
    await queryInterface.addIndex('Videos', ['category']);
    await queryInterface.addIndex('Videos', ['isPublic']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Videos');
  },
};
