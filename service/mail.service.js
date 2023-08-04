const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const { text } = require('express');
dotenv.config();
const mailService = {
    async sendEmail({ emailFrom, emailTo, subject, text }) {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_USERNAME,
                pass: process.env.SMTP_PASSWORD,
            },
            
        }
        );
        console.log(emailFrom,emailTo,subject,text);
        console.log(process.env.SMTP_HOST);
        await transporter.sendMail({
            from: emailFrom,
            to: emailTo,
            subject: subject,
            text: text
        });
    }
};
Object.freeze(mailService);
module.exports = { mailService, };