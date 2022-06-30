const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');

//route 1: register new User
router.post('/register', [
    body('name', 'Enter a name more than three characters').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('pwd', 'Enter a password of min three characters').isLength({ min: 3 }),
    body('cnfpwd', 'Enter a password of min three characters').isLength({ min: 3 })
], async (req, res) => {
    const { name, email, pwd, cnfpwd, prof } = req.body;
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ errors: error.array() });
    }
    if (pwd.localeCompare(cnfpwd) !== 0) {
        return res.status(400).json({ errors: "Password must match with confirm Password" })
    }
    let user = await User.findOne({ email: req.body.email });
    if (user) {
        return res.status(400).json({ error: "Sorry a user with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(pwd, salt);
    // Create a new user
    user = await User.create({
        name, email, pwd: secPass, prof
    });
    res.json(user);
})

//Login new User
router.post('/login', async (req, res) => {
    const { email, pwd } = req.body;
    let user = await User.findOne({ email })
    if (!user) return res.status(400).json({ error: "User doesn't exist" })
    const match = await bcrypt.compare(pwd, user.pwd)
    if (!match) return res.status(400).json({ error: "incorrect credentials" })
    return res.json(user);
})
module.exports = router;