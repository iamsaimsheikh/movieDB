const express = require('express');
const router = express.Router();
const UserServ =  require('../services/userServices')

// Register A User

router.post('/register', async ( req, res ) => {
    UserServ.userRegister(req, res);
})

// User Login

router.post('/login', async ( req, res ) => {
    UserServ.userLogin(req, res);
})

router.post('/verify/:userId/:uniqueString', async (req, res) => {
    UserServ.userVerify(req, res);
})

router.post('/passwordReset', async (req, res) => {
    UserServ.passwordReset(req, res);
})

router.post('/setNewPassword', async (req, res) => {
    UserServ.setNewPassword(req, res);
})

module.exports = router