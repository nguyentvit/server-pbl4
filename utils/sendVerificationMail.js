import dotenv from "dotenv";
dotenv.config();
 import createMailTransporter from "./createMailTransporter.js";

// export const sendVerificationMail = (res, email, token, url) => {
//     const transporter = createMailTransporter();
//     const mailOptions = {
//         from: 'nguyentv.it@gmail.com',
//         to: email,
//         subject: 'Account activation link',
//         html: `<h1>Please click on given link to activate your account</h1>
//         <p>http://localhost:${process.env.PORT}/${url}/${token}</p>
//         `

//     };
//     transporter.sendMail(mailOptions, (err, info) => {
//         if (err) {
//             return res.json({
//                 error: err.message
//             })
//         } 
//         return res.json({message: 'Email has been sent, kindly activate your account'});
//     })
// }

// export const sendVerificationMail = (res, email, otp) => {
//     const transporter = createMailTransporter();
//     const mailOptions = {
//         from: 'nguyentv.it@gmail.com',
//         to: email,
//         subject: 'OTP Verification Code',
//         html: `<h1>Your OTP: ${otp}</h1>`
//     };
//     transporter.sendMail(mailOptions, (err, info) => {
//         if (err) {
//             return res.json({
//                 error: err.message
//             });
//         } 
//         return res.json({message: 'OTP has been sent to your email'});
//     });
// };
// import createMailTransporter from './createMailTransporter.js';

const sendVerificationMail = async (res, email, otp, link) => {
    try {
        const transporter = createMailTransporter(); // Tạo transporter từ hàm đã được viết trước đó

        // Tạo nội dung email
        const mailOptions = {
            from: 'nguyentv.it@gmail.com',
            to: email,
            subject: 'OTP Verification Code',
            html: `<div>
            <h1>Link active</h1>
            <a href="https://localhost:5173/${link}/${otp}">Active link</a>
            </div>`
        };

        // Gửi email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};
export { sendVerificationMail };

