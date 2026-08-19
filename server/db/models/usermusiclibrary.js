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
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, isInt: true },
      },
      trackId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, isInt: true },
      },
      isFavorite: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      playsCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
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
