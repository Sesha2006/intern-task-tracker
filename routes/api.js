const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Task = require('../models/Task');
const TaskLog = require('../models/TaskLog');

// Add Intern or Admin
router.post('/users', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.json({ _id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Assign Task
router.post('/tasks', async (req, res) => {
  try {
    const task = await Task.create(req.body);
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Get All Tasks
router.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Task Status
router.patch('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const oldStatus = task.status;
    task.status = req.body.status;
    await task.save();

    await TaskLog.create({
      taskId: task._id,
      oldStatus,
      newStatus: task.status,
      timestamp: new Date()
    });

    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get Tasks by Intern
router.get('/tasks/intern/:internId', async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.params.internId });
    res.json(tasks);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Dashboard Progress
router.get('/dashboard/progress', async (req, res) => {
  try {
    const interns = await User.find({ role: 'intern' });

    const result = await Promise.all(interns.map(async (intern) => {
      const tasks = await Task.find({ assignedTo: intern._id });
      return {
        internId: intern._id,
        internName: intern.name,
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        inProgressTasks: tasks.filter(t => t.status === 'in progress').length,
        pendingTasks: tasks.filter(t => t.status === 'pending').length
      };
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
