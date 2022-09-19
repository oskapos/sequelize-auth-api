import { Router } from 'express';
import models from '../../models';
import runAsyncWrapper from '../../utils/runAsyncWrapper';

const router = Router();
const { User } = models;

router.post(
  '/register',
  runAsyncWrapper(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (user) {
      return res.status(200).send({ success: false, message: 'User already exists' });
    }

    //static method: using a transaction => outsourced it to the model (User) (kind of a rule!)
    const result = await User.createNewUser(req.body);

    const { accessToken, refreshToken } = result;

    return res.send({
      success: true,
      message: 'User successfully registered',
      data: {
        accessToken,
        refreshToken,
      },
    });
  })
);

export default router;
