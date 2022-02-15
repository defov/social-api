const router = require('express').Router();
const User = require('../models/User')
const bcrypt = require('bcrypt')

// Register
router.post('/register', async (req, res) => {

    const { username, email, password } = req.body;

    try {
        // generate new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt)
        
        // create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        })

        // save user and return response
        const user = await newUser.save()
        res.status(201).json(user)
    } catch(err) {
        res.status(500).json(err)
    }
})

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email })
        if(!user) {
            return res.status(404).json("User not found!");
        }

        const validPassword = await bcrypt.compare(password, user.password)
        if(!validPassword) {
            return res.status(400).json("Wrong password!");
        }

        res.status(200).json(user)
    } catch (err) {
        res.status(500).json(err);
    }
})

module.exports = router;