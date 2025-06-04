const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Debug Middleware: Logs all incoming requests
app.use((req, res, next) => {
  console.log(`Incoming request: [${req.method}] ${req.url}`);
  next();
});

// Root route - a simple welcome message
app.get('/', (req, res) => {
  res.send('Welcome to the Intern Task Tracker API');
});

// ✅ Load routes
const apiRoutes = require('./routes/api'); // This file must exist!
app.use('/api', apiRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Start server on port 6000
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
