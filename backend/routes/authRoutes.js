const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  let user = await Student.findOne({ email });
  let role = 'student';
  if (!user) {
    user = await Teacher.findOne({ email });
    role = 'teacher';
  }
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.password !== password)
    return res.status(401).json({ message: 'Invalid password' });
  const { password: _, ...userData } = user.toObject();
  res.json({ ...userData, role });
});

module.exports = router;
