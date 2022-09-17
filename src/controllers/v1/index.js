import { Router } from 'express';
import registeRtouter from './register';

const router = Router();

router.use(registeRtouter);

export default router;
