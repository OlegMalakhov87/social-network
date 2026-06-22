const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserVideoLibrary extends Model {
    static associate({ User, Video }) {
      this.belongsTo(User, {
        foreignKey: 'userId',
        as: 'users',
      });
      this.belongsTo(Video, {
        foreignKey: 'videoId',
        as: 'videos',
      });
    }
  }

  UserVideoLibrary.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      videoId: { type: DataTypes.INTEGER, allowNull: false },
      isFavorite: { type: DataTypes.BOOLEAN, defaultValue: false },
      viewCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
          isInt: true,
        },
      },
      lastWatchedAt: DataTypes.DATE,
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
        {
          fields: ['userId', 'videoId'],
          unique: true,
        },
      ],
    }
  );

  return UserVideoLibrary;
};
