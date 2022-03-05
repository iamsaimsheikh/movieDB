const nodemailer = require('nodemailer')
const uuid = require('uuid').v4;
const bcrypt = require('bcrypt')
const UserVerification = require('../models/userVerification');
const PasswordReset = require('../models/passwordReset');

require('dotenv').config()

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS
    }
})


const sendUserVerificationEmail = async (id, email, res) => {

    const currentURL = "http://localhost:8000/"

    const uniqueString = id;

    // Mail Option

    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "Verify Your Email",
        html: `<p>Verify your email address to complete the signup and login to your account.</p><p>This link will <b>expire in 6 hours</b></p><p>Click <a href=${currentURL + "user/verify/" + id + "/" + uniqueString}> Here </a> to proceed </p>`
    }

    // Hash the Unique String

    const saltRounds = 5;
    const hashing = await bcrypt.hash(uniqueString, saltRounds)
    .then(async hashedUniqueString => {
        const newUserVerification = new UserVerification({
            userId: id,
            uniqueString: hashedUniqueString,
            createdAt: Date.now(),
            expiresAt: Date.now() + 21600000
        })

       await newUserVerification.save()
        .then(async () => {
            await transporter.sendMail(mailOptions)
            .then(() => {
                res.send("Verification Email Sent")
                console.log(uniqueString)
                console.log(id)
            })
            .catch(err => {
                res.send("Could Not Send Verification Email")
            })
        })
        .catch(err => {
            res.send("Could Not Save User Verification Data")
        })
    })
    .catch(err => {
        res.send("Error While Hashing Unique String")
    })

}

const sendResetEmail = async (_id, email, redirectUrl, res) => {

    

    const resetString = _id;

    // Clear all existing reset records
    await PasswordReset.deleteMany({userId: _id})
    .then(result => {

    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "Password Reset",
        html: `<p>Reset Your Password</p><p>This link will <b>expire in 60 Minutes</b></p><p>Click <a href=${redirectUrl + "user/verify/" + _id + "/" + resetString}> Here </a> to proceed </p>`
    }

    const saltRounds = 5;
    bcrypt.hash(resetString, saltRounds)
    .then(hashedResetString => {
        const newPasswordReset =  new PasswordReset({
            userId: _id,
            resetString: hashedResetString,
            createdAt: Date.now(),
            expiresAt: Date.now() + 360000
        })

        newPasswordReset.save()
        .then(() => {
            transporter.sendMail(mailOptions)
            .then(() => {
                res.send("Password Reset Email Sent Successfully!")
            })
        })
        .catch(err => {
            console.log(err)
            res.send("Error while sending reset link")
        })
    })
    .catch(err => {
        console.log(err)
        res.send('Error while hashing reset link')
    })

    })
    .catch(err => {
        res.send(err.message)
    })
}


module.exports.sendUserVerificationEmail = sendUserVerificationEmail
module.exports.sendResetEmail = sendResetEmail

