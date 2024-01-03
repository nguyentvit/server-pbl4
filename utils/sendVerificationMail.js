import dotenv from "dotenv";
dotenv.config();
import createMailTransporter from "./createMailTransporter.js";

const sendVerificationMail = async (res, email, otp, link) => {
  try {
    const transporter = createMailTransporter();
    const mailOptions = {
      from: "nguyentv.it@gmail.com",
      to: email,
      subject: "Link Verification",
      html: `<div>
            <h1>Link active</h1>
            <a href="https://3.25.234.79:5173/${link}/${otp}">Active link</a>
            </div>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};
export { sendVerificationMail };
