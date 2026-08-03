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
      userId: { type: DataTypes.INTEGER, allowNull: false },
      videoId: { type: DataTypes.INTEGER, allowNull: false },
      isFavorite: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      viewsCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
          isInt: true,
        },
      },
      lastWatchedAt: {
        type: DataTypes.DATE,
        defaultValue: null,
        allowNull: true,
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
