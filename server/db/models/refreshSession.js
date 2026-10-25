const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RefreshSession extends Model {
    static associate({ User, UsedRefreshToken }) {
      RefreshSession.belongsTo(User, { foreignKey: 'userId', as: 'user' });
      RefreshSession.hasMany(UsedRefreshToken, {
        foreignKey: 'sessionId',
        as: 'usedTokens',
      });
    }
  }

  RefreshSession.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      tokenHash: {
        type: DataTypes.STRING(64),
        allowNull: false,
        unique: true,
      },

      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'RefreshSession',
      tableName: 'RefreshSessions',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    }
  );

  return RefreshSession;
};
