import { Router } from 'express';
import models from '../../models';
import JWTUtils from '../../utils/jwt-utils';
import runAsyncWrapper from '../../utils/runAsyncWrapper';

const router = Router();
const { User, Role, sequelize } = models;

router.post(
  '/register',
  runAsyncWrapper(async (req, res) => {
    const { email, password, roles } = req.body;
    const user = await User.findOne({ where: { email } });

    if (user) {
      return res.status(200).send({ success: false, message: 'User already exists' });
    }

    try {
      //Wrapping operations in a transaction
      const result = await sequelize.transaction(async () => {
        //create the user
        const newUser = await User.create({ email, password });

        const jwtPayload = { email };
        //Create Tokens
        const accessToken = JWTUtils.generateAccessToken(jwtPayload);
        const refreshToken = JWTUtils.generateRefreshToken(jwtPayload);

        //associate the Refresh Token with the User (Sequelize Method)
        await newUser.createRefreshToken({ token: refreshToken });

        //Create The user Roles
        if (roles && Array.isArray(roles)) {
          const rolesToSave = [];
          //Here a promise is returned in each loop => forEach won't work here
          // roles.forEach(async (role) => {
          //   const newRole = await Role.create({ role });
          //   rolesToSave.push(newRole);
          // });

          //We either use a regular for loop or Promise.all( )
          for (const role of roles) {
            const newRole = await Role.create({ role });
            rolesToSave.push(newRole);
          }
          //associate the roles created with the user (Sequelize Method)
          await newUser.addRoles(rolesToSave);
        }

        //store tokens in the result variable
        return { accessToken, refreshToken };
      });

      const { accessToken, refreshToken } = result;

      return res.send({
        success: true,
        message: 'User successfully registered',
        data: {
          accessToken,
          refreshToken,
        },
      });
    } catch (err) {
      console.log('Error registering the user:\n', err.stack);
      return res.status(500), send({ success: false, message: err.message });
    }
  })
);

export default router;
