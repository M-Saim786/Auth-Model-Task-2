const nodemailer = require("nodemailer")
require("dotenv").config()
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.smtpMail,
        pass: process.env.smtpPassKey
    },
    tls: {
        rejectUnauthorized: false,
    },

})

module.exports.sendEmail = (to, subject, html) => {
    var mailOptions = {
        from: "saimrashid3344@gmail.com",
        to: to,
        subject: subject,
        html: html
    };
    transporter.sendMail(mailOptions, (err, result) => {
        if (err) {
            console.log(err)
        }
    })
}