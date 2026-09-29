import { emailVerificationMailgenContent, sendMail } from "../utils/mail.js";
import { ApiResponse } from "../utils/api-response.js";

const testEmailSender = async (req, res) => {
  const mailgenContent = emailVerificationMailgenContent(
    "joe Pemor",
    "https://open.spotify.com",
  );

  const options = {
    email: "ldjoe3998@gmail.com",
    subject: "Hello from Project Manager",
    mailgenContent: mailgenContent,
  };

  const sent = await sendMail(options);
  if (sent) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, { message: "email successfully sent" }, "success"),
      );
  }

  return res
    .status(500)
    .json(
      new ApiResponse(500, { message: "email could not be sent" }, "failed"),
    );
};

export default testEmailSender;
