import express from 'express';
import sendMailResetPassword from './routes/sendMailResetPassword.route';
import sendCreateUserConfirm from './routes/sendCreateUserConfirmation.route';
import sendAppointementConfirmationRouter from './routes/sendAppointementConfirmation.route';

const router = express.Router();

// 🧭 routing
router.use('/', sendMailResetPassword);
router.use('/mail/user/create', sendCreateUserConfirm);
router.use('/mail/appointment/create', sendAppointementConfirmationRouter);

export default router;
