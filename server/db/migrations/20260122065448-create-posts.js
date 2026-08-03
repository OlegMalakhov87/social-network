/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Posts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      text: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      media: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      isPublic: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      type: {
        type: Sequelize.ENUM('text', 'image', 'video'),
        allowNull: false,
        defaultValue: 'text',
      },
      pinned: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
    await queryInterface.addIndex('Posts', ['userId']);
    await queryInterface.addIndex('Posts', ['userId', 'createdAt']);
    await queryInterface.addIndex('Posts', ['isPublic']);
    await queryInterface.addIndex('Posts', ['type']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Posts');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_Posts_type";'
    );
  },
};
