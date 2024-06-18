const jwt = require('jsonwebtoken');
const { db } = require('../config/firebase');
require('dotenv').config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const authenticate = async (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({
        status: 'error',
        message: 'No token provided, authorization denied'
        });
    }

    try {
        const tokenDoc = await db.collection('blacklist').doc(token).get();
        if (tokenDoc.exists) {
        return res.status(401).json({
            status: 'error',
            message: 'Token is blacklisted'
        });
        }

        const decoded = jwt.verify(token, JWT_SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({
        status: 'error',
        message: 'Token is not valid'
        });
    }
};

module.exports = { authenticate };
