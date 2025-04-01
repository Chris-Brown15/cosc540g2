const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json({ extended: false }));
app.use(cors());

// Define routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));
app.use('/api/upload', require('./routes/upload'));
app.use(express.static('public'));

// Simple test route
app.get('/', (req, res) => {
  res.send('API is running');
});

// Set port and start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));