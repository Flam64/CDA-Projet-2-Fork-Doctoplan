import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { transporter } from './utils/transporter';
import router from './router';

const app = express();

app.use(cors());
app.use(express.json());

app.use(router);

app.get('/mail', (req, res) => {
  res.send('Welcome to the server (email sending management).');
});

const port = process.env.SERVER_PORT;

// 📋 checking that the SMTP server is working properly
transporter.verify((error, success) => {
  if (error) {
    console.error(error);
  } else {
    console.info('📫 Server is ready to take our messages: ', `${success == true ? '✅' : '❌'} `);
  }
});

app.listen(port, () => {
  console.log(`🖥️  Server to manage emails is running on http://localhost:${port}`);
});
