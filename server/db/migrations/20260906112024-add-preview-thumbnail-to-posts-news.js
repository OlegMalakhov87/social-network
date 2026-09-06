
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Posts', 'previewUrl', {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
    await queryInterface.addColumn('Posts', 'thumbnailUrl', {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
    await queryInterface.addColumn('News', 'previewUrl', {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
    await queryInterface.addColumn('News', 'thumbnailUrl', {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Posts', 'previewUrl');
    await queryInterface.removeColumn('Posts', 'thumbnailUrl');
    await queryInterface.removeColumn('News', 'previewUrl');
    await queryInterface.removeColumn('News', 'thumbnailUrl');
  },
};
