const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserVideoLibrary extends Model {
    static associate({ User, Video }) {
      this.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user',
      });
      this.belongsTo(Video, {
        foreignKey: 'videoId',
        as: 'video',
      });
    }
  }

  UserVideoLibrary.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1 },
      },
      videoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1 },
      },
      isFavorite: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      lastWatchedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
      viewsCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { min: 0 },
      },
    },
    {
      sequelize,
      modelName: 'UserVideoLibrary',
      tableName: 'UserVideoLibraries',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      //underscored: true,
      indexes: [
        { fields: ['userId'] },
        { fields: ['videoId'] },
        {
          fields: ['userId', 'videoId'],
          unique: true,
        },
      ],
    }
  );

  return UserVideoLibrary;
};
