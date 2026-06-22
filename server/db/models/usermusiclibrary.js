const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserMusicLibrary extends Model {
    static associate({ User, Music }) {
      this.belongsTo(User, {
        foreignKey: 'userId',
        as: 'users',
      });
      this.belongsTo(Music, {
        foreignKey: 'trackId',
        as: 'tracks',
      });
    }
  }

  UserMusicLibrary.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      trackId: { type: DataTypes.INTEGER, allowNull: false },
      isFavorite: { type: DataTypes.BOOLEAN, defaultValue: false },
      playCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
          isInt: true,
        },
      },
    },
    {
      sequelize,
      modelName: 'UserMusicLibrary',
      tableName: 'UserMusicLibraries',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      //underscored: true,
      indexes: [
        {
          fields: ['userId', 'trackId'],
          unique: true,
        },
      ],
    }
  );

  return UserMusicLibrary;
};
