import { sendEmail } from '../transporter';
import ejs from 'ejs';

type EmailOptions = {
  email: string;
  subject: string;
  emailTemplate: string; // 💡 represents file that represents the body of the email to be sent (.ejs file)
  dataTemplate: { url?: string; doctor?: string; date?: string; hour?: string };
};
export const sendEmailByTemplate = async ({
  email,
  subject,
  emailTemplate,
  dataTemplate,
}: EmailOptions): Promise<void> => {
  const emailHtml = await ejs.renderFile(__dirname + `/../../views/templates/${emailTemplate}`, {
    dataTemplate,
  });

  await sendEmail({
    to: email,
    subject: subject,
    html: emailHtml,
  });
};
