import express from 'express';
import { apiResponse } from '../../../utils/response';

const router = express.Router();

// THIS IS A DUMMY ENDPOINT THAT WILL BE CALLED EVERY 15 MINUTES BY A CON-JOB SERVER, TO ELIMINATE SLEEPS ON SOURCE SERVER
router.get('/', (req, res) => apiResponse(res, 'con job successful'));

export default router;
