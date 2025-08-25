const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const studentRoutes = require('./routes/studentRoutes');
const authRoutes = require('./routes/authRoutes');
const Student = require('./models/Student');

console.log('Starting server initialization...');

const app = express();

// Middleware
console.log('Setting up middleware...');
app.use(cors());
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// MongoDB Connection
console.log('Connecting to MongoDB...');
mongoose
  .connect('mongodb://localhost:27017/attendance')
  .then(async () => {
    console.log('Connected to MongoDB');
    // Verify data exists
    const count = await Student.countDocuments();
    console.log('Number of students in database:', count);
    const students = await Student.find();
    console.log('Students in database:', students);
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Routes
console.log('Registering student routes...');
app.use('/api/students', studentRoutes);
app.use('/api/auth', authRoutes);
console.log('Student routes registered');

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).send({ message: 'Something broke!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log('Server is ready to handle requests');
});
