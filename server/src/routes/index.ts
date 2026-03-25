import { Router } from 'express';
import healthRouter from './health';
import piRouter from './pi';

const router = Router();

router.use('/health', healthRouter);
router.use('/pi', piRouter);

export default router;
