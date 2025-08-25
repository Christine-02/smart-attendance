const mongoose = require('mongoose');
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');

const students = [
  {
    name: 'John Doe',
    roll: 'STU001',
    email: 'student1@example.com',
    password: 'password123',
    attendance: [],
  },
  {
    name: 'Jane Smith',
    roll: 'STU002',
    email: 'student2@example.com',
    password: 'password456',
    attendance: [],
  },
  {
    name: 'Mike Johnson',
    roll: 'STU003',
    email: 'student3@example.com',
    password: 'password789',
    attendance: [],
  },
  {
    name: 'Sarah Williams',
    roll: 'STU004',
    email: 'student4@example.com',
    password: 'password321',
    attendance: [],
  },
  {
    name: 'David Brown',
    roll: 'STU005',
    email: 'student5@example.com',
    password: 'password654',
    attendance: [],
  },
];

const teachers = [
  {
    name: 'Professor Brown',
    email: 'teacher1@example.com',
    password: 'teacher123',
  },
  {
    name: 'Dr. Wilson',
    email: 'teacher2@example.com',
    password: 'teacher456',
  },
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/attendance');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Student.deleteMany({});
    console.log('Cleared existing data');

    // Insert new data
    await Student.insertMany(students);
    console.log('Added test students to database');

    await Teacher.deleteMany({});
    await Teacher.insertMany(teachers);
    console.log('Added test teachers to database');

    // Disconnect
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase();
