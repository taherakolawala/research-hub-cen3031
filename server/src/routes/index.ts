import { Router } from 'express';
import healthRouter from './health';
import piRouter from './pi';
import studiesRouter from './studies';

const router = Router();

router.use('/health', healthRouter);
router.use('/pi', piRouter);
router.use('/studies', studiesRouter);

export default router;
