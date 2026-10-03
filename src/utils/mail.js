import Mailgen from "mailgen";
import nodemailer from "nodemailer";

/**
 * the data that the object {option: params of sendMail} should carry 
 * 
 *  const options = {
      email: "ldjoe3998@gmail.com",
      subject: "Hello from Project Manager",
      mailgenContent: mailgenContent,
    };
*/

const sendMail = async (option) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "project manager",
      link: "http://ProjectManager.com",
    },
  });

  const emailTextFormat = mailGenerator.generatePlaintext(
    option.mailgenContent,
  );
  const emailHtmlFormat = mailGenerator.generate(option.mailgenContent);

  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: process.env.MAILTRAP_SMTP_PORT,
    auth: {
      user: process.env.MAILTRAP_SMTP_USERNAME,
      pass: process.env.MAILTRAP_SMTP_PASSWORD,
    },
  });

  const mail = {
    from: "joelsonjesururoejuvweyerome@gmail.com",
    to: option.email,
    subject: option.subject,
    text: emailTextFormat,
    html: emailHtmlFormat,
  };

  try {
    await transporter.sendMail(mail);
    return true;
  } catch (error) {
    console.error(
      "Email service failed siliently. Make sure that you have provided your MAILTRAP credentials in the .env file",
    );
    console.error("Error: ", error);
  }
};

const emailVerificationMailgenContent = (username, emailVerificationUrl) => {
  return {
    body: {
      name: username,
      intro:
        "Welcome to Project Manager, we are glad to have you on board, 'For great project needs a great manager 😁'",
      action: {
        instruction:
          "To get started with Project Manager, click on the button below: ",
        button: {
          color: " #22BC66",
          text: "Confirm Your Account",
          link: emailVerificationUrl,
        },
      },
      outro: "Need help, or have questions? Just reply to this email",
    },
  };
};

const forgetPasswordMailgenContent = (username, resetPasswordUrl) => {
  return {
    body: {
      name: username,
      intro:
        "You have received this email because a password reset request for your account was received.",
      action: {
        instruction: "Click the button below to reset your password: ",
        button: {
          color: " #22BC66",
          text: "Reset Password",
          link: resetPasswordUrl,
        },
      },
      outro: "Need help, or have questions? Just reply to this email",
    },
  };
};

export {
  emailVerificationMailgenContent,
  forgetPasswordMailgenContent,
  sendMail,
};
