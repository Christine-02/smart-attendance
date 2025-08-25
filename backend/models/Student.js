const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: String,
  roll: String,
  email: String, // Added for login
  password: String, // Added for login
  attendance: [
    {
      date: Date,
      status: String,
    },
  ],
});

module.exports = mongoose.model('Student', studentSchema);
