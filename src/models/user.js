import { Model, DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
import environment from '../config/environment';

export default (sequelize) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models['Role']);
      User.hasOne(models['RefreshToken']);
    }

    static async hashPassword(password) {
      return bcrypt.hash(password, environment.saltRounds);
    }

    static async comparePasswords(password, hashedPassword) {
      return bcrypt.compare(password, hashedPassword);
    }
  }

  //Initialize the Model
  User.init(
    {
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: {
            msg: 'Not a vaild email address',
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING(50),
        unique: true,
      },
      firstNmae: {
        type: DataTypes.STRING(50),
        validate: {
          len: {
            args: [0, 50],
            msg: 'First name has too many charachters',
          },
        },
      },
      lastName: {
        type: DataTypes.STRING(50),
        validate: {
          len: {
            args: [0, 50],
            msg: 'Last name has too many charachters',
          },
        },
      },
    },
    //An options obj to configure the model
    {
      sequelize,
      modelName: 'User',
      indexes: [{ unique: true, fields: ['email'] }],
    }
  );

  //Pre Hook to Hash the pasword before saving it to DB
  User.beforeSave(async (user, options) => {
    const hashedPassword = await User.hashPassword(user.password);
    user.password = hashedPassword;
  });

  return User;
};
