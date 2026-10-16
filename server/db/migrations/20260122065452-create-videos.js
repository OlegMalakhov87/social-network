/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Videos', {
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
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      size: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      videoUrl: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      thumbnailUrl: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      previewUrl: {
        type: Sequelize.STRING(500),
        allowNull: false,
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
      viewsCount: {
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
    await queryInterface.addIndex('Videos', ['uploadedBy']);
    await queryInterface.addIndex('Videos', ['createdAt']);
    await queryInterface.addIndex('Videos', ['title']);
    await queryInterface.addIndex('Videos', ['category']);
    await queryInterface.addIndex('Videos', ['isPublic']);
    await queryInterface.addIndex('Videos', ['viewsCount']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Videos');
  },
};
