import dotenv from "dotenv";
dotenv.config();

import createMailTransporter from "./createMailTransporter.js";

export const sendVerificationMail = (res, email, token, url) => {
    const transporter = createMailTransporter();
    const mailOptions = {
        from: 'nguyentv.it@gmail.com',
        to: email,
        subject: 'Account activation link',
        html: `<h1>Please click on given link to activate your account</h1>
        <p>http://localhost:${process.env.PORT}/${url}/${token}</p>
        `

    };
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            return res.json({
                error: err.message
            })
        } 
        return res.json({message: 'Email has been sent, kindly activate your account'});
    })
}

