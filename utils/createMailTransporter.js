import nodemailer from "nodemailer";

const createMailTransporter = () => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'nguyentv.it@gmail.com',
            pass: 'sxbx skof xgii rfgm'
        }
    });
    return transporter;
}

export default createMailTransporter ;