import express from 'express';
import { sendCreateUserConfirm } from '../modules/users/controller';
const router = express.Router();

router.post('/', sendCreateUserConfirm);

export default router;
