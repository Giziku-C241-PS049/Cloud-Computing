const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const generateToken = (payload) => {
    if (!JWT_SECRET_KEY) {
        throw new Error('JWT_SECRET_KEY must be defined');
    }
    return jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: '8d' });
};

module.exports = { generateToken };
