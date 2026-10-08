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
      archivedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      origin: {
        type: Sequelize.ENUM('manual', 'automated'),
        allowNull: false,
        defaultValue: 'manual',
      },
      externalUrl: {
        type: Sequelize.STRING(1000),
        allowNull: true,
      },
      externalId: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      publishedAt: {
        type: Sequelize.DATE,
        allowNull: true,
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
    await queryInterface.addConstraint('News', {
      fields: ['source', 'externalId'],
      type: 'unique',
      name: 'news_source_external_id_unique',
    });
    await queryInterface.addIndex('News', ['category']);
    await queryInterface.addIndex('News', ['viewsCount']);
    await queryInterface.addIndex('News', ['type']);
    await queryInterface.addIndex('News', ['archivedAt']);
    await queryInterface.addIndex('News', ['archivedAt', 'createdAt']);
    await queryInterface.addIndex('News', ['origin']);
    await queryInterface.addIndex('News', ['externalUrl']);
    await queryInterface.addIndex('News', ['source', 'externalId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('News');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_News_type";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_News_origin";'
    );
  },
};
