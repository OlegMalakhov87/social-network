const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class NewsIngestionRecord extends Model {
    static associate(models) {
      NewsIngestionRecord.belongsTo(models.News, {
        foreignKey: 'newsId',
        as: 'news',
      });
    }
  }

  NewsIngestionRecord.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },

      source: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 100],
        },
      },

      externalId: {
        type: DataTypes.STRING(500),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 500],
        },
      },

      externalUrl: {
        type: DataTypes.STRING(1000),
        allowNull: true,
        validate: {
          len: [1, 1000],
        },
      },

      status: {
        type: DataTypes.ENUM('published', 'rejected', 'failed'),
        allowNull: false,
      },

      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      attempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },

      lastError: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      newsId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      processedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'NewsIngestionRecord',
      tableName: 'NewsIngestionRecords',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',

      indexes: [
        {
          unique: true,
          fields: ['source', 'externalId'],
        },
        {
          fields: ['status'],
        },
        {
          fields: ['newsId'],
        },
      ],
    }
  );

  return NewsIngestionRecord;
};
