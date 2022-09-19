import { Model, DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
import environment from '../config/environment';
import JWTUtils from '../utils/jwt-utils';

export default (sequelize) => {
  class User extends Model {
    static associate(models) {
      User.Role = User.hasMany(models['Role']);
      User.RefreshToken = User.hasOne(models['RefreshToken']);
    }

    static async hashPassword(password) {
      return bcrypt.hash(password, environment.saltRounds);
    }

    //we might also deconstruct firstName, lastName ... (we're not using them right now)
    static async createNewUser({ email, password, roles }) {
      return sequelize.transaction(async () => {
        const jwtPayload = { email };
        //Create Tokens
        const accessToken = JWTUtils.generateAccessToken(jwtPayload);
        const refreshToken = JWTUtils.generateRefreshToken(jwtPayload);

        //Map the roles sent with the req to an array
        let rolesToSave = [];
        if (roles && Array.isArray(roles)) {
          rolesToSave = roles.map((role) => ({
            role,
          }));
        }

        //Create the user and the corresponding roles and refreshToken records while passing the userId to them
        //Creating with association(All in one go)
        await User.create(
          {
            email,
            password,
            Roles: rolesToSave,
            RefreshToken: { token: refreshToken },
          },
          { include: [User.Role, User.RefreshToken] }
        );

        //store tokens in the result variable
        return { accessToken, refreshToken };
      });
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
      firstName: {
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
      defaultScope: {
        attributes: { exclude: ['password'] },
      },
      scopes: {
        withPassword: {
          attributes: { include: ['password'] },
        },
      },
    }
  );

  // This is an instance method, why?
  // because of the default scope the hashed password won't be always available on the users we're getting from the DB, and that is because sometimes the user might be sent to the client and we don't want the password to go there with him except for specific cases like when authenticating the user which is what this method does,
  // and so in the login controller we want to use this method on the specific user instance where we also get the password along the user
  User.prototype.comparePasswords = async function (password) {
    return bcrypt.compare(password, this.password);
  };

  //Pre Hook to Hash the password before saving it to DB
  User.beforeSave(async (user, options) => {
    const hashedPassword = await User.hashPassword(user.password);
    user.password = hashedPassword;
  });

  return User;
};
