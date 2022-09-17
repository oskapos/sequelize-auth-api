import { Router } from 'express';
import models from '../../models';
import JWTUtils from '../../utils/jwt-utils';
import runAsyncWrapper from '../../utils/runAsyncWrapper';

const router = Router();
const { User } = models;

router.post(
  '/login',
  runAsyncWrapper(async (req, res) => {
    const { email, password } = req.body;
    //get the user with this email from DB
    const user = await User.findOne({ where: { email } });

    //check credentials
    if (!user || !(await User.comparePasswords(password, user.password))) {
      return res.status(401).send({ success: false, message: 'Invalid credentials' });
    }

    const payload = { email };
    const accessToken = JWTUtils.generateAccessToken(payload);
    //get the user's refresh token from DB
    const savedRefreshToken = await user.getRefreshToken();

    let refreshToken;

    // if 1) No refreshToken associated with this user OR  2) there is but it's null or empty
    if (!savedRefreshToken || !savedRefreshToken.token) {
      //create a new refreshToken
      refreshToken = JWTUtils.generateRefreshToken(payload);
      //1) ==> link it to the user
      if (!savedRefreshToken) {
        await user.createRefreshToken({ token: refreshToken });
      } else {
        // 2) ==> Set it with the newly created one
        user.refreshToken.token = refreshToken;
        await user.RefreshToken.save();
      }
      //There is a valid refreshToken for this user and it is not null ==> use it
    } else {
      refreshToken = savedRefreshToken.token;
    }

    return res.status(200).send({
      success: true,
      message: 'Successfully Logged In',
      data: { accessToken, refreshToken },
    });
  })
);

export default router;
