import type { RequestHandler } from 'express';
import { sendEmailByTemplate } from '../../utils/mails/send.mail';

const sendResetPassword: RequestHandler = async (req, res) => {
  const { email, url } = req.body;

  try {
    await sendEmailByTemplate({
      email,
      subject: '📧 Réinitialisation de mot de passe utilisateur - DoctoPlan',
      emailTemplate: 'resetMail.ejs',
      dataTemplate: { url },
    });
    res.sendStatus(200);
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    res.sendStatus(500);
  }
};

const sendCreateUserConfirm: RequestHandler = async (req, res) => {
  const { email, url, generatedPassword, departementLabel, role } = req.body;
  try {
    await sendEmailByTemplate({
      email,
      subject: '📧 Bienvenu, vos informations de connexion - DoctoPlan',
      emailTemplate: 'confirmMail.ejs',
      dataTemplate: { url, generatedPassword, departementLabel, role },
    });
    res.sendStatus(200);
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    res.sendStatus(500);
  }
};

export { sendResetPassword, sendCreateUserConfirm };
