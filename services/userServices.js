const bcrypt = require('bcrypt')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const { userRegisterValidation, userLoginValidation } = require('../routes/validation')
const uuid = require('uuid').v4;
const {sendUserVerificationEmail, sendResetEmail} = require('./mailer');
const UserVerification = require('../models/userVerification');
const PasswordReset = require('../models/passwordReset');
const {cloudinary} = require('../config/cloudinary');
const Actor =  require('../models/actor');
const Movie =  require('../models/movie');


const userRegister = async (req, res) => {

    const data = req.body;

    // Data Validation
    
        const {error} = userRegisterValidation(data);
        if(error) return res.status(400).send(error.details[0].message)
    
        const userExists = await User.findOne({email:data.email}) 
        if (userExists) return res.status(400).send("Email Already Exists")
    
    // Encrypting Password
    
        const salt = await bcrypt.genSalt(10)
        const hashedPassword =  await bcrypt.hash(req.body.password, salt)
    
        let user =  new User({
            _id: uuid(),
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            password: hashedPassword,
            verified: false
        })
    
        try {
    
            await user.save()
            sendUserVerificationEmail(user._id, user.email, res)
    
        } catch (error) {
    
            res.send(error.message)
    
        }

}

const userLogin = async (req, res) => {

    const data = req.body;

    const {error} = userLoginValidation(data);
    if(error) return res.status(400).send(error.details[0].message)



// Data Validation

    const userExists = await User.findOne({email:data.email}) 
    if (!userExists) return res.status(400).send("Invalid Email Or Password")

// User Verification

    if(userExists.verified === false) return res.status(400).send("User is not verified")

// Password Verification

    const validPass = await bcrypt.compare(data.password , userExists.password)
    if (!validPass) return res.status(400).send("Invalid Email or Password")

// Generating JWT

    if( userExists && validPass ) {
        
        const token = jwt.sign({_id:userExists._id},process.env.TOKEN_SECRET);
        res.header('auth-token', token).send(token);

    }    

}

const userVerify = async (req, res) => {

    //  Get Data through parameters

    let {userId, uniqueString} = req.params
    
    //  Check if user exists

   await UserVerification.findOne({userId: userId})
    .then(verification => {

    // Check Expiry and hashed unique string
        
        const {expiresAt} = verification;
        const hashedUniqueString = verification.uniqueString;

    //  If expired them clean up user and verification document

        if(expiresAt < Date.now){
            UserVerification.deleteOne({userId: userId})
            .then(() => {
                User.findByIdAndDelete({userId: userId})
                console.log("User with expired verification link deleted!")
            })
            .catch((err) => {
                res.send('Error deleting user with expired verification link!')
                console.log(err);
            })
        }
        else {

    //  Compare encryted string
            
             bcrypt.compare(uniqueString, hashedUniqueString)
             .then(result => {
                if(result){

    //  Update user and verify it

                    User.updateOne({_id: userId}, {verified: true})
                    .then(() => {
                        console.log("deleting User")

    //  Clean up verification document

                        UserVerification.deleteOne({userId: verification.userId})
                    })
                    .catch(err => {
                        res.send("Error updating verification status")
                        console.log(err.message)
                    })
                }
                else {
                    res.send("Invalid verification details passed!")
                }
            }).catch(err => {
                res.send("Error occured while comparing hashed string!")
                console.log(err.message);
            })

        }
    })
    .catch(err => {
        res.status(400).send(err.message)
    })

}

const passwordReset = async (req, res) => {

    const {email, redirectUrl} = req.body;
    
    // Check User Exists and Verified 

    const userExists = await User.findOne({email: email})
    if(!userExists) return res.status(400).send("User with provided email does not exist!")
    if(userExists.verified == false) return res.status(400).send("User with provided email is not verified")

    // Send Reset Email

    await sendResetEmail(userExists._id, email, redirectUrl, res)

}

const setNewPassword = async (req, res) => {

    // Get Data
    const {_id, resetString, newPassword } = req.body;


    // Find the password reset document

    await  PasswordReset.findOne({userId: _id})
    .then(response => {

    // Get Expiry and Hashed Reset String of Password Reset Document

        const {expiresAt} = response
        const hashedResetString = response.resetString

    //If expired then delete the password reset document  

        if( Date.now() > expiresAt ){
            PasswordReset.findOneAndDelete({userId: _id})
            .then(() => {
                res.send("Your password verification link has been expired, please request a new one!")
            })
            .catch((err) => {
                res.send("Error deleting expired password reset link!")
            })
        }
        else {

    //  Compare reset string

            bcrypt.compare(resetString, hashedResetString)
            .then((result) =>{
                console.log(result)
                if(result){

    //  Create New Hashed Password

                    const saltRounds = 5 
                    const newHashedPassword = bcrypt.hash(newPassword, saltRounds)

    //  Update the user password 

                    .then(hashedPassword => {
                        User.updateOne({userId: _id}, {password:hashedPassword})

    //  Clean up the password reset document

                    .then((response) => {
                        PasswordReset.findOneAndDelete({hashedResetString})
                        .then(() => {
                            console.log("Password Reset Deleted Successfully")
                        })
                        .catch(err => {
                            console.log('Could Not Delete Password Reset Document')
                            res.send(err)
                        })
                        res.send("Password Reset Successfully!")
                    })
                    .catch(err => {
                        console.log(err)
                        res.send("Error resetting password!")
                    })
                    })
                }
                else{
                    res.send("Invalid user credentials passed!")
                }
            })
            .catch(err => {
                console.log(err)
                res.send("Error comparing hashed reset string")
            })
        }


    })
    .catch(err => {
        res.status(400).send("Invalid Password Reset Link")
        console.log(err)
    })
}

const uploadActorPicture = async (req, res) => {

    // Find the actor

    const {actor} = req.body

    const actorExists = await Actor.findOne({name:actor})
    if(!actorExists) return res.status(400).send("Actor not found")

    // Upload image to cloudinary

    const uploadedResponse = await cloudinary.uploader.
    upload(req.files.image.tempFilePath, {
        folder: "movieDb"
    })
    .then((response) => {

    // Save image path in the Actor document

        actorExists.update({picture: response.url})
        .then(() => {
            res.send("Profile Picture Updated")
        })
        .catch(err => {
            res.send(err.message)
        })
        res.send("Image uploaded successfully")
    })
    .catch(err => {
        console.log(err)
    })


}

const addMoviePoster = async (req, res) => {

    // Find the movie

    const {movie} = req.body

    const movieExists = await Movie.findOne({name:movie})
    if(!movieExists) return res.status(400).send("Movie not found")
 
    // Upload movie poster to cloudinary

    const uploadedResponse = await cloudinary.uploader.
    upload(req.files.image.tempFilePath, {
        folder: "movieDb"
    })
    .then((response) => {

    // Push the new poster link to the posters array in movie document and save
    
        movieExists.posters.push(response.url)
        movieExists.save()
        .then(() => {
            res.send("Poster Added")
        })
        .catch(err => {
            res.send(err.message)
        })
    })
    .catch(err => {
        console.log(err)
    })

}

module.exports = {userRegister: userRegister, userLogin: userLogin, userVerify: userVerify,
     passwordReset: passwordReset, setNewPassword: setNewPassword,
      uploadActorPicture: uploadActorPicture, addMoviePoster: addMoviePoster}