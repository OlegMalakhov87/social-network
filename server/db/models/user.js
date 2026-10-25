const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Обращается к классу модели напрямую, потому что метод статический.
      User.hasMany(models.Post, { foreignKey: 'userId', as: 'posts' });

      User.hasMany(models.Music, { foreignKey: 'uploadedBy', as: 'tracks' });

      User.hasMany(models.Video, { foreignKey: 'uploadedBy', as: 'videos' });

      User.hasMany(models.News, { foreignKey: 'uploadedBy', as: 'news' });

      User.hasMany(models.TemporaryMedia, {
        foreignKey: 'userId',
        as: 'temporaryMedia',
      });

      User.hasMany(models.RefreshSession, {
        foreignKey: 'userId',
        as: 'refreshSessions',
      });

      User.hasMany(models.Message, {
        foreignKey: 'senderId',
        as: 'sentMessages',
      });

      User.hasMany(models.Message, {
        foreignKey: 'receiverId',
        as: 'receivedMessages',
      });

      User.hasMany(models.Like, { foreignKey: 'userId', as: 'likes' });

      User.hasMany(models.Comment, { foreignKey: 'userId', as: 'comments' });

      User.hasMany(models.Friend, {
        foreignKey: 'userId',
        as: 'sentFriendRequests',
      });

      User.hasMany(models.Friend, {
        foreignKey: 'friendId',
        as: 'receivedFriendRequests',
      });

      User.belongsToMany(models.Music, {
        through: models.UserMusicLibrary,
        foreignKey: 'userId',
        otherKey: 'trackId',
        as: 'musicLibrary',
      });

      User.belongsToMany(models.Video, {
        through: models.UserVideoLibrary,
        foreignKey: 'userId',
        otherKey: 'videoId',
        as: 'videoLibrary',
      });
      User.hasMany(models.UserMusicLibrary, {
        foreignKey: 'userId',
        as: 'musicLibraryItems',
      });
      User.hasMany(models.UserVideoLibrary, {
        foreignKey: 'userId',
        as: 'videoLibraryItems',
      });
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      nickname: {
        type: DataTypes.STRING(100),
        allowNull: true,
        unique: true,
        validate: {
          len: [1, 100],
        },
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          len: [1, 100],
          notEmpty: true,
        },
      },
      birthDate: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
          isDate: true,
        },
      },
      email: {
        type: DataTypes.STRING(55),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          len: [5, 55],
          notEmpty: true,
        },
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: [1, 500],
        },
      },
      job: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
          len: [1, 100],
        },
      },
      status: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: [1, 500],
        },
      },
      phone: {
        type: DataTypes.STRING(25),
        allowNull: true,
        unique: true,
        validate: {
          len: [1, 25],
        },
      },
      avatarUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
          len: [1, 500],
        },
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      isSystem: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      gender: {
        type: DataTypes.ENUM('male', 'female'),
        allowNull: false,
        defaultValue: 'male',
      },
      passwordHash: {
        type: DataTypes.STRING(60),
        allowNull: false,
        validate: {
          len: [60, 60],
          notEmpty: true,
        },
      },
    },

    {
      sequelize,
      modelName: 'User',
      tableName: 'Users',
      timestamps: true,
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      //underscored: true,
      indexes: [{ fields: ['name'] }],
    }
  );
  return User;
};
