const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: ''
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'review', 'completed'],
    default: 'todo'
  },
  dueDate: {
    type: Date,
    required: true
  },
  completedAt: {
    type: Date,
    default: null
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true,
    maxlength: 20
  }],
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: {
      type: String,
      required: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  estimatedHours: {
    type: Number,
    min: 0,
    default: 0
  },
  actualHours: {
    type: Number,
    min: 0,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
taskSchema.index({ creator: 1, status: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ 'assignedTo.user': 1 });

// Virtual for checking if task is overdue
taskSchema.virtual('isOverdue').get(function() {
  if (this.status === 'completed') return false;
  return this.dueDate < new Date();
});

// Virtual for days until due
taskSchema.virtual('daysUntilDue').get(function() {
  if (this.status === 'completed') return 0;
  const now = new Date();
  const due = new Date(this.dueDate);
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Method to mark task as completed
taskSchema.methods.markCompleted = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Method to add comment
taskSchema.methods.addComment = function(userId, content) {
  this.comments.push({
    user: userId,
    content: content
  });
  return this.save();
};

// Method to assign user to task
taskSchema.methods.assignUser = function(userId) {
  const isAlreadyAssigned = this.assignedTo.some(assignment => 
    assignment.user.toString() === userId.toString()
  );
  
  if (!isAlreadyAssigned) {
    this.assignedTo.push({ user: userId });
  }
  return this.save();
};

// Method to remove user from task
taskSchema.methods.removeUser = function(userId) {
  this.assignedTo = this.assignedTo.filter(assignment => 
    assignment.user.toString() !== userId.toString()
  );
  return this.save();
};

// Ensure virtuals are included in JSON output
taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Task', taskSchema); 