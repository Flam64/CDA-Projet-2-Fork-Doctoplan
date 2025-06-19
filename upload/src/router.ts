import express from 'express';
import multer from 'multer';
import PatientFile from './controllers/PatientFile';
import { authMiddleware } from './middlewares/auth.middleware';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = 'public/patient/';
    if (req.originalUrl === '/upload/appointment-sec-file') {
      folder = 'public/appointmentSecretary/';
    } else if (req.originalUrl === '/upload/appointment-doctor-file') {
      folder = 'public/appointmentDoctor/';
    }
    cb(null, folder);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });

const router = express.Router();

router.post(
  '/upload/patient-file',
  authMiddleware(['secretary']),
  upload.single('myfile'),
  PatientFile.upload('patient-file'),
);

router.post(
  '/upload/appointment-sec-file',
  authMiddleware(['secretary']),
  upload.single('myfile'),
  PatientFile.upload('appointment-sec-file'),
);

router.post(
  '/upload/appointment-doctor-file',
  authMiddleware(['doctor']),
  upload.single('myfile'),
  PatientFile.upload('appointment-doctor-file'),
);

export default router;
