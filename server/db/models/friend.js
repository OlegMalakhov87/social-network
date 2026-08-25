const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Friend extends Model {
    static associate({ User }) {
      this.belongsTo(User, { foreignKey: 'userId', as: 'user' });
      this.belongsTo(User, { foreignKey: 'friendId', as: 'friend' });
    }
  }
  Friend.init(
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
        validate: { min: 1, isInt: true },
      },
      friendId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, isInt: true },
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
      updatedAt: 'updatedAt',
      //underscored: true,
      indexes: [
        {
          fields: ['userId', 'friendId'],
          unique: true,
        },
        { fields: ['userId', 'status'] },
        { fields: ['friendId', 'status'] },
      ],
    }
  );
  return Friend;
};
