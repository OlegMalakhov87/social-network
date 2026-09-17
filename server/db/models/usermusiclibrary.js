const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserMusicLibrary extends Model {
    static associate({ User, Music }) {
      this.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user',
      });
      this.belongsTo(Music, {
        foreignKey: 'trackId',
        as: 'track',
      });
    }
  }

  UserMusicLibrary.init(
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
      trackId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1 },
      },
      isFavorite: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      playsCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
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
        { fields: ['userId'] },
        { fields: ['trackId'] },
        {
          fields: ['userId', 'trackId'],
          unique: true,
        },
      ],
    }
  );

  return UserMusicLibrary;
};
