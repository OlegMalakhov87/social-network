const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  
  class TemporaryMedia extends Model {
    static associate({ User }) {
      this.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user',
      });
    }
  }

  TemporaryMedia.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
        },
      },

      url: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          len: [1, 500],
        },
      },

      mediaType: {
        type: DataTypes.ENUM('image', 'video', 'audio'),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },

      fieldName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },

      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'TemporaryMedia',
      tableName: 'TemporaryMedias',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      //underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['url'],
        },
        {
          fields: ['expiresAt'],
        },
      ],
    }
  );

  return TemporaryMedia;
};
