import { Router } from 'express';
import models from '../../models';
import runAsyncWrapper from '../../utils/runAsyncWrapper';
import requiresAuth from '../../middlewares/requiresAuth';

const router = Router();
const { User, RefreshToken } = models;

router.post(
  '/logout',
  requiresAuth(), //in order to logout u must be logged in first
  runAsyncWrapper(async (req, res) => {
    const { jwt } = req.body;
    const user = await User.findOne({ where: { email: jwt.email }, include: RefreshToken });
    //We're not deleting the whole record, we're just setting the token value to null
    user.RefreshToken.token = null;
    user.RefreshToken.save();
    return res.status(200).send({ success: true, message: 'Successfully logged out' });
  })
);

export default router;
