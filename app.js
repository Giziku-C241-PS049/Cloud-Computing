// require('dotenv').config();
// const express = require('express');
// const app = express();
// const bodyParser = require('body-parser');
// const userRoutes = require('./giziku-backend/routes/userRoutes');
// const foodRoutes = require('./giziku-backend/routes/foodRoutes');

// app.use(bodyParser.json());

// app.use('/users', userRoutes);
// app.use('/foods', foodRoutes);

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { register, login, updateUsername, updatePassword, deleteAccount, logout } = require('./controllers/authController');
const { authenticate } = require('./middleware/authMiddleware');

const app = express();
app.use(bodyParser.json());

// Register route
app.post('/register', register);

// Login route
app.post('/login', login);

// Update username route
app.put('/update-username', authenticate, updateUsername);

// Update password route
app.put('/update-password', authenticate, updatePassword);

// Delete account route
app.delete('/delete-account', authenticate, deleteAccount);

// Logout route
app.post('/logout', authenticate, logout);

// Protected route example
app.get('/protected', authenticate, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
