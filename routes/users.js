const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Task = require('../models/Task');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    res.json({
      user: req.user.toProfileJSON()
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  auth,
  body('firstName')
    .optional()
    .notEmpty()
    .withMessage('First name cannot be empty')
    .isLength({ max: 50 })
    .withMessage('First name must be less than 50 characters'),
  body('lastName')
    .optional()
    .notEmpty()
    .withMessage('Last name cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Last name must be less than 50 characters'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer-not-to-say'])
    .withMessage('Gender must be one of: male, female, other, prefer-not-to-say'),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, bio, gender, avatar } = req.body;
    const updateFields = {};

    if (firstName !== undefined) updateFields.firstName = firstName;
    if (lastName !== undefined) updateFields.lastName = lastName;
    if (bio !== undefined) updateFields.bio = bio;
    if (gender !== undefined) updateFields.gender = gender;
    if (avatar !== undefined) updateFields.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateFields,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: user.toProfileJSON()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get task statistics
    const totalTasks = await Task.countDocuments({
      $or: [
        { creator: userId },
        { 'assignedTo.user': userId }
      ]
    });

    const completedTasks = await Task.countDocuments({
      $or: [
        { creator: userId },
        { 'assignedTo.user': userId }
      ],
      status: 'completed'
    });

    const overdueTasks = await Task.countDocuments({
      $or: [
        { creator: userId },
        { 'assignedTo.user': userId }
      ],
      status: { $ne: 'completed' },
      dueDate: { $lt: new Date() }
    });

    const tasksByPriority = await Task.aggregate([
      {
        $match: {
          $or: [
            { creator: userId },
            { 'assignedTo.user': userId }
          ]
        }
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const tasksByStatus = await Task.aggregate([
      {
        $match: {
          $or: [
            { creator: userId },
            { 'assignedTo.user': userId }
          ]
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent activity
    const recentTasks = await Task.find({
      $or: [
        { creator: userId },
        { 'assignedTo.user': userId }
      ]
    })
    .sort({ updatedAt: -1 })
    .limit(5)
    .populate('creator', 'username firstName lastName')
    .populate('assignedTo.user', 'username firstName lastName');

    res.json({
      stats: {
        totalTasks,
        completedTasks,
        overdueTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        tasksByPriority: tasksByPriority.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        tasksByStatus: tasksByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      },
      recentTasks
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/search
// @desc    Search users for task assignment
// @access  Private
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } }, // Exclude current user
        { isActive: true },
        {
          $or: [
            { username: { $regex: q, $options: 'i' } },
            { firstName: { $regex: q, $options: 'i' } },
            { lastName: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } }
          ]
        }
      ]
    })
    .select('username firstName lastName email avatar')
    .limit(10);

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID (public profile)
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('username firstName lastName avatar bio createdAt')
      .where('isActive', true);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's public tasks
    const publicTasks = await Task.find({
      creator: req.params.id,
      isPublic: true,
      status: { $ne: 'completed' }
    })
    .sort({ dueDate: 1 })
    .limit(5);

    res.json({
      user,
      publicTasks
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;