const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', [
  auth,
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title must be less than 200 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  body('dueDate')
    .notEmpty()
    .withMessage('Due date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  body('assignedTo')
    .optional()
    .isArray()
    .withMessage('Assigned users must be an array'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      tags,
      estimatedHours,
      isPublic
    } = req.body;

    // Validate assigned users exist
    if (assignedTo && assignedTo.length > 0) {
      const userIds = assignedTo.map(user => user.user || user);
      const users = await User.find({ _id: { $in: userIds } });
      if (users.length !== userIds.length) {
        return res.status(400).json({ message: 'One or more assigned users not found' });
      }
    }

    const task = new Task({
      title,
      description: description || '',
      priority: priority || 'medium',
      dueDate,
      creator: req.user._id,
      assignedTo: assignedTo || [],
      tags: tags || [],
      estimatedHours: estimatedHours || 0,
      isPublic: isPublic || false
    });

    await task.save();

    // Populate creator and assigned users
    await task.populate([
      { path: 'creator', select: 'username firstName lastName avatar' },
      { path: 'assignedTo.user', select: 'username firstName lastName avatar' }
    ]);

    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tasks
// @desc    Get all tasks for the authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const {
      status,
      priority,
      search,
      sortBy = 'dueDate',
      sortOrder = 'asc',
      page = 1,
      limit = 10
    } = req.query;

    const query = {
      $or: [
        { creator: req.user._id },
        { 'assignedTo.user': req.user._id }
      ]
    };

    // Add filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const tasks = await Task.find(query)
      .populate('creator', 'username firstName lastName avatar')
      .populate('assignedTo.user', 'username firstName lastName avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(query);

    res.json({
      tasks,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalTasks: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get a specific task
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('creator', 'username firstName lastName avatar')
      .populate('assignedTo.user', 'username firstName lastName avatar')
      .populate('comments.user', 'username firstName lastName avatar');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to this task
    const hasAccess = task.creator._id.toString() === req.user._id.toString() ||
                     task.assignedTo.some(assignment => 
                       assignment.user._id.toString() === req.user._id.toString()
                     ) ||
                     task.isPublic;

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', [
  auth,
  body('title')
    .optional()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Title must be less than 200 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  body('status')
    .optional()
    .isIn(['todo', 'in-progress', 'review', 'completed'])
    .withMessage('Invalid status'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user can edit this task
    if (task.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the creator can edit this task' });
    }

    const updateFields = req.body;
    
    // Handle status change to completed
    if (updateFields.status === 'completed' && task.status !== 'completed') {
      updateFields.completedAt = new Date();
    } else if (updateFields.status !== 'completed') {
      updateFields.completedAt = null;
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).populate([
      { path: 'creator', select: 'username firstName lastName avatar' },
      { path: 'assignedTo.user', select: 'username firstName lastName avatar' }
    ]);

    res.json({
      message: 'Task updated successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user can delete this task
    if (task.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the creator can delete this task' });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/tasks/:id/assign
// @desc    Assign users to a task
// @access  Private
router.post('/:id/assign', [
  auth,
  body('userIds')
    .isArray()
    .withMessage('User IDs must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user can assign to this task
    if (task.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the creator can assign users to this task' });
    }

    const { userIds } = req.body;

    // Validate users exist
    const users = await User.find({ _id: { $in: userIds } });
    if (users.length !== userIds.length) {
      return res.status(400).json({ message: 'One or more users not found' });
    }

    // Add new assignments
    for (const userId of userIds) {
      await task.assignUser(userId);
    }

    await task.populate([
      { path: 'creator', select: 'username firstName lastName avatar' },
      { path: 'assignedTo.user', select: 'username firstName lastName avatar' }
    ]);

    res.json({
      message: 'Users assigned successfully',
      task
    });
  } catch (error) {
    console.error('Assign users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/tasks/:id/comment
// @desc    Add a comment to a task
// @access  Private
router.post('/:id/comment', [
  auth,
  body('content')
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ max: 500 })
    .withMessage('Comment must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has access to this task
    const hasAccess = task.creator.toString() === req.user._id.toString() ||
                     task.assignedTo.some(assignment => 
                       assignment.user.toString() === req.user._id.toString()
                     ) ||
                     task.isPublic;

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await task.addComment(req.user._id, req.body.content);

    await task.populate([
      { path: 'creator', select: 'username firstName lastName avatar' },
      { path: 'assignedTo.user', select: 'username firstName lastName avatar' },
      { path: 'comments.user', select: 'username firstName lastName avatar' }
    ]);

    res.json({
      message: 'Comment added successfully',
      task
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/tasks/:id/complete
// @desc    Mark a task as completed
// @access  Private
router.post('/:id/complete', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user can complete this task
    const canComplete = task.creator.toString() === req.user._id.toString() ||
                       task.assignedTo.some(assignment => 
                         assignment.user.toString() === req.user._id.toString()
                       );

    if (!canComplete) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await task.markCompleted();

    await task.populate([
      { path: 'creator', select: 'username firstName lastName avatar' },
      { path: 'assignedTo.user', select: 'username firstName lastName avatar' }
    ]);

    res.json({
      message: 'Task marked as completed',
      task
    });
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 