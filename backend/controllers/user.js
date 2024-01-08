const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { CustomError } = require('../middleware/errorHandler');
require('dotenv').config()
const secreteKey = process.env.SECRETE_KEY

exports.signup = async (req, res, next) => {
    try {
        const { Username, Password } = req.body;
        
        const hashedPassword = await bcrypt.hash(Password, 10);

        const user = {
            Username: Username,
            Password: hashedPassword
        };

        const signup = await User.create(user);

        if (!signup) {
            throw new CustomError('Something went wrong', 404);
        }

        res.status(200).json({
            success: true,
            signup
        });
    } catch (error) {
        next(error);
        console.error('Error during signup:', error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { Username, Password } = req.body;

        const user = await User.findOne({ Username });

        if (!user) {
            throw new CustomError('User not found', 404);
        }

        const isPasswordValid = await bcrypt.compare(Password, user.Password);

        if (!isPasswordValid) {
            throw new CustomError('Invalid password', 401);
        }

        const token = jwt.sign({ userId: user._id, Username: user.Username }, secreteKey, {
            expiresIn: '1h'
        });

        res.status(200).json({
            success: true,
            token
        });
    } catch (error) {
        next(error);
        console.error('Error during signup:', error);
    }
};
