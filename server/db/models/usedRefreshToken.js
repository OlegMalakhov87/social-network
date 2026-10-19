const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UsedRefreshToken extends Model {
    static associate({ RefreshSession }) {
      // Сессия, в которой был использован токен
      UsedRefreshToken.belongsTo(RefreshSession, {
        foreignKey: 'sessionId',
        as: 'session',
      });
    }
  }

  UsedRefreshToken.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },

      sessionId: {
        type: DataTypes.UUID,
        allowNull: false,
      },

      tokenHash: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: 'UsedRefreshToken',
      tableName: 'UsedRefreshTokens',
      timestamps: true,
      updatedAt: false,
      createdAt: 'createdAt',
    }
  );

  return UsedRefreshToken;
};
