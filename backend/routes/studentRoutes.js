const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const QRCode = require('qrcode');
const AttendanceList = require('../linkedlist');

// Create a new attendance list instance
const attendanceList = new AttendanceList();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Student routes are working' });
});

router.get('/recent-attendance', (req, res) => {
  const recentRecords = attendanceList.toArray();
  res.json({
    records: recentRecords,
    count: recentRecords.length,
    lastUpdated: new Date(),
  });
});

// Generate QR
router.get('/generate/:roll', async (req, res) => {
  const roll = req.params.roll;
  const timestamp = new Date().getTime();
  const qrData = JSON.stringify({
    rollNumber: roll,
    timestamp: timestamp,
  });
  const qr = await QRCode.toDataURL(qrData);
  res.send({ qr });
});

// Get Attendance Records
router.get('/attendance', async (req, res) => {
  try {
    const { date } = req.query;
    let query = {};

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      query = {
        'attendance.date': {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }

    const students = await Student.find(query);
    const records = students.flatMap((student) =>
      student.attendance.map((record) => ({
        rollNumber: student.roll,
        name: student.name,
        date: record.date,
        time: record.date.toLocaleTimeString(),
        status: record.status,
      }))
    );

    // Sort records by date (most recent first)
    records.sort((a, b) => b.date - a.date);

    res.json(records);
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    res.status(500).send({ message: 'Error fetching attendance records' });
  }
});

// Mark Attendance
router.post('/attendance', async (req, res) => {
  const { roll, rollNumber } = req.body;
  const studentRoll = roll || rollNumber;
  console.log('Received attendance request for roll:', studentRoll);

  if (!studentRoll) {
    return res.status(400).send({ message: 'Roll number is required' });
  }

  const date = new Date();
  const dateStr = date.toISOString().split('T')[0];

  // Add to linked list first
  const attendanceRecord = {
    roll: studentRoll,
    date: date,
    status: 'Present',
    timestamp: date.getTime(),
  };
  attendanceList.insert(attendanceRecord);
  console.log('Added to linked list:', attendanceRecord);

  // Then save to MongoDB
  try {
    const student = await Student.findOne({ roll: studentRoll });
    if (student) {
      // Check if attendance already exists for this date
      const exists = student.attendance.some(
        (a) => a.date.toISOString().split('T')[0] === dateStr
      );

      if (exists) {
        return res
          .status(400)
          .send({ message: 'Attendance already marked for today' });
      }

      student.attendance.push({ date, status: 'Present' });
      await student.save();
      console.log('Attendance marked successfully for:', studentRoll);
      res.send({
        message: 'Marked Present',
        recentActivity: attendanceList.toArray(),
      });
    } else {
      console.log('Student not found:', studentRoll);
      res.status(404).send({ message: 'Student not found' });
    }
  } catch (error) {
    console.error('Error saving attendance:', error);
    res.status(500).send({ message: 'Error saving attendance' });
  }
});

// Sync attendance list to database
router.post('/sync-attendance', async (req, res) => {
  try {
    const records = attendanceList.toArray();
    let syncedCount = 0;

    for (const record of records) {
      const student = await Student.findOne({ roll: record.roll });
      if (student) {
        // Check if attendance already exists for this date
        const exists = student.attendance.some(
          (a) =>
            a.date.toISOString().split('T')[0] ===
            record.date.toISOString().split('T')[0]
        );
        if (!exists) {
          student.attendance.push({ date: record.date, status: record.status });
          await student.save();
          syncedCount++;
        }
      }
    }

    // Clear the linked list after successful sync
    attendanceList.clear();

    res.send({
      message: 'Attendance synced successfully',
      syncedRecords: syncedCount,
    });
  } catch (error) {
    console.error('Error syncing attendance:', error);
    res.status(500).send({ message: 'Error syncing attendance' });
  }
});

// Get Student Details - This should be last since it has a parameter
router.get('/:roll', async (req, res) => {
  const roll = req.params.roll;
  console.log('Received request for roll:', roll);

  try {
    const student = await Student.findOne({ roll: roll });
    console.log('Database query result:', student);

    if (student) {
      const response = {
        rollNumber: student.roll,
        name: student.name,
        class: 'CS101',
        email: `${student.roll.toLowerCase()}@example.com`,
      };
      console.log('Sending response:', response);
      res.json(response);
    } else {
      console.log('No student found with roll:', roll);
      res.status(404).send({ message: 'Student not found' });
    }
  } catch (error) {
    console.error('Error in /:roll route:', error);
    res.status(500).send({ message: 'Error fetching student details' });
  }
});

module.exports = router;
