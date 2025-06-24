import express from 'express';
import 'dotenv/config';
import router from './router';
import { authMiddleware } from './middlewares/auth.middleware';

const app = express();

app.use(express.json());
app.use(router);
app.use(
  '/upload/public/appointmentSecretary',
  authMiddleware(['secretary', 'doctor']),
  express.static('public/appointmentSecretary'),
);
app.use(
  '/upload/public/patient',
  authMiddleware(['secretary', 'doctor']),
  express.static('public/patient'),
);
app.use(
  '/upload/public/appointmentDoctor',
  authMiddleware(['doctor']),
  express.static('public/appointmentDoctor'),
);

const port = process.env.SERVER_PORT || 5050;

app.listen(port, () => {
  console.info(`Server to manage upload is running on http://localhost:${port}`);
});
