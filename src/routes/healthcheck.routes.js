import { Router } from 'express';
import healthChecker from '../controller/healthcheck.controller.js';

const router = Router();

router.route('/').get(healthChecker);

export default router;

// this are the route that the healthcheck can go through 
