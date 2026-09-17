/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('News', {
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
      text: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('text', 'image', 'video'),
        allowNull: false,
        defaultValue: 'text',
      },
      source: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      newsUrl: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      previewUrl: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      thumbnailUrl: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      isEdited: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
    await queryInterface.addIndex('News', ['category']);
    await queryInterface.addIndex('News', ['viewsCount']);
    await queryInterface.addIndex('News', ['type']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('News');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_News_type";'
    );
  },
};
