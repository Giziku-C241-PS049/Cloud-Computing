const bcrypt = require('bcryptjs');
const { db } = require('../config/firebase');
const { generateToken } = require('../utils/tokenUtil');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  const { email, password, username } = req.body;

  try {
    // Check if user already exists
    const userRef = db.collection('users').doc(email);
    const doc = await userRef.get();
    if (doc.exists) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'User already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user to Firestore
    await db.collection('users').doc(email).set({
      email,
      username,
      password: hashedPassword,
    });

    res.status(201).json({ 
      status: 'success',
      message: 'User registered successfully',
      data: {
        email,
        username,
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Get user from Firestore
    const userRef = db.collection('users').doc(email);
    const doc = await userRef.get();
    if (!doc.exists) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Invalid credentials' 
      });
    }

    const user = doc.data();

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT
    const token = generateToken({ email: user.email });

    res.status(200).json({
      status: 'success',
      message: 'User logged in successfully',
      data: {
        email: user.email,
        username: user.username,
        token,
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message,
    });
  }
};

const updateUsername = async (req, res) => {
  const { email } = req.user;
  const { newUsername } = req.body;

  if (!newUsername) {
    return res.status(400).json({
      status: 'error',
      message: 'New username is required'
    });
  }

  try {
    await db.collection('users').doc(email).update({ username: newUsername });
    res.status(200).json({
      status: 'success',
      message: 'Username updated successfully',
      data: { email, newUsername }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Server error', error: error.message });
  }
};

const updatePassword = async (req, res) => {
  const { newPassword } = req.body;
  const userId = req.user.uid; // Make sure the user ID is extracted correctly

  if (!newPassword) {
    return res.status(400).json({
      status: 'error',
      message: 'New password is required'
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.collection('users').doc(userId).update({
      password: hashedPassword
    });

    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
};


const logout = async (req, res) => {
  const token = req.header('Authorization').replace('Bearer ', '');

  try {
    await db.collection('blacklist').doc(token).set({
      token: token
    });

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
};


const deleteAccount = async (req, res) => {
  const { email } = req.user;

  try {
    const userRef = db.collection('users').doc(email);
    await userRef.delete();

    res.status(200).json({
      status: 'success',
      message: 'User account deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message,
    });
  }
};

module.exports = { register, login, updateUsername, updatePassword, deleteAccount, logout };