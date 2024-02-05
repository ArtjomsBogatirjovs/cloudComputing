const nodemailer = require('nodemailer');
const constants = require('../constants');

const transporter = nodemailer.createTransport({
    service: constants.SERVICE_MAIL,
    auth: {
        user: constants.USER_MAIL,
        pass: constants.PASS_MAIL
    }
});

const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "3747dbaf890a91",
        pass: "981e4d754345f6"
    }
});

function sendEMail(receiverMail, text) {
    const mailOptions = {
        from: constants.USER_MAIL,
        to: receiverMail,
        subject: 'Car plate service drive in/out',
        text: text
    };

    transport.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

module.exports = {sendMail: sendEMail};