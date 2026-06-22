const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Friend extends Model {
    static associate({ User }) {
      this.belongsTo(User, { foreignKey: 'userId', as: 'users' });
      this.belongsTo(User, { foreignKey: 'friendId', as: 'friends' });
    }
  }
  Friend.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      friendId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'accepted', 'blocked'),
        defaultValue: 'pending',
      },
    },
    {
      sequelize,
      modelName: 'Friend',
      tableName: 'Friends',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: false,
      //underscored: true,
      indexes: [
        { fields: ['status'] },
        {
          fields: ['userId', 'friendId'],
          unique: true,
        },
      ],
    }
  );
  return Friend;
};
