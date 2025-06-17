import type { RequestHandler } from 'express';
import { sendEmailByTemplate } from '../../utils/mails/send.mail';

const sendAppointementConfirmation: RequestHandler = async (req, res) => {
  const { email, doctor, date, hour } = req.body;

  try {
    await sendEmailByTemplate({
      email,
      subject: 'Confirmation de votre rendez-vous - DoctoPlan',
      emailTemplate: 'appointementConfirmation.ejs',
      dataTemplate: { doctor, date, hour },
    });

    res.sendStatus(200);
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email de confirmation :", error);
    res.sendStatus(500);
  }
};

export { sendAppointementConfirmation };
