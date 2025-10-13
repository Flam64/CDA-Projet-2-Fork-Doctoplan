import express from 'express';
import { sendAppointementConfirmation } from '../modules/appointements/controller';

const router = express.Router();

router.post('/', sendAppointementConfirmation);

export default router;
