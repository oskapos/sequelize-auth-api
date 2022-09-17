import { Router } from 'express';
import models from '../../models';
import JWTUtils from '../../utils/jwt-utils';
import runAsyncWrapper from '../../utils/runAsyncWrapper';
import requiresAuth from '../../middlewares/requiresAuth';

const router = Router();
const { User, RefreshToken } = models;

//THIS MIDDLEWARE GRANTS THE USER A NEW ACCESS TOKEN BASED ON THE REFRESH TOKEN
//(WITHOUT ASKING FOR CREDENTIALS AGAIN)

router.post(
  '/token',
  //verify the refresh token
  requiresAuth('refreshToken'),
  runAsyncWrapper(async (req, res) => {
    //the refreshToken the user provided
    const { jwt } = req.body;
    //the refresh token in our Database
    const user = User.findOne({ where: { email: jwt.email }, include: RefreshToken });
    const savedToken = user.RefreshToken;

    //Check if refresh token also exist and valid in the Db (it might not be after a long time visiting for example )
    if (!savedToken || !savedToken.token) {
      return res.status(401).send({ success: false, message: 'You must log in first' });
    }

    //He has a valid refresh token ==> generate for him a new access token
    const payload = { email: user.email };
    const newAccessToken = JWTUtils.generateAccessToken(payload);
    return res.status(200).send({ success: true, data: { accessToken: newAccessToken } });
  })
);

export default router;
