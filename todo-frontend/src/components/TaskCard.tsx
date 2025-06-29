import React from 'react';
import { format } from 'date-fns';
import {
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  UserGroupIcon,
  TagIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface TaskCardProps {
  task: {
    _id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'todo' | 'in-progress' | 'review' | 'completed';
    dueDate: string;
    creator: {
      _id: string;
      username: string;
      firstName: string;
      lastName: string;
    };
    assignedTo: Array<{
      user: {
        _id: string;
        username: string;
        firstName: string;
        lastName: string;
      };
    }>;
    tags: string[];
    estimatedHours: number;
    isPublic: boolean;
    isOverdue: boolean;
    daysUntilDue: number;
    createdAt: string;
    updatedAt: string;
  };
  onEdit: (task: any) => void;
  onDelete: (taskId: string) => void;
  onComplete: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onComplete }) => {
  // Calculate if task is due soon (2 days or less)
  const today = new Date();
  const dueDate = new Date(task.dueDate);
  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const isDueSoon = daysUntilDue <= 2 && daysUntilDue >= 0 && task.status !== 'completed';
  const isOverdue = daysUntilDue < 0 && task.status !== 'completed';
  
  // Determine effective priority (auto-upgraded if due soon)
  const effectivePriority = isDueSoon ? 'high' : task.priority;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'review':
        return 'bg-purple-100 text-purple-800';
      case 'todo':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDueDateText = () => {
    if (task.status === 'completed') {
      return 'Completed';
    }

    if (task.isOverdue) {
      return `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''}`;
    }

    if (daysUntilDue === 0) {
      return 'Due today';
    } else if (daysUntilDue === 1) {
      return 'Due tomorrow';
    } else if (daysUntilDue > 0) {
      return `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`;
    } else {
      return `Due ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''} ago`;
    }
  };

  const getDueDateColor = () => {
    if (task.status === 'completed') return 'text-green-600';
    if (task.isOverdue) return 'text-red-600';
    if (daysUntilDue <= 1) return 'text-orange-600';
    return 'text-gray-600';
  };

  return (
    <li className="px-6 py-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <button
                onClick={() => onComplete(task._id)}
                className={`p-1 rounded-full transition-colors ${
                  task.status === 'completed'
                    ? 'text-green-600 hover:text-green-700'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <CheckCircleIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className={`text-sm font-medium text-gray-900 truncate ${
                  task.status === 'completed' ? 'line-through' : ''
                }`}>
                  {task.title}
                </h3>
                
                {/* Auto-upgraded priority indicator */}
                {isDueSoon && task.priority !== 'high' && task.priority !== 'urgent' && (
                  <ExclamationTriangleIcon className="h-4 w-4 text-orange-500" title="Priority auto-upgraded to high" />
                )}
              </div>
              
              {task.description && (
                <p className="text-sm text-gray-500 truncate mt-1">
                  {task.description}
                </p>
              )}
              
              <div className="flex items-center space-x-2 mt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(effectivePriority)}`}>
                  {effectivePriority.charAt(0).toUpperCase() + effectivePriority.slice(1)}
                  {isDueSoon && task.priority !== 'high' && task.priority !== 'urgent' && (
                    <span className="ml-1 text-xs">(auto)</span>
                  )}
                </span>
                
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status.replace('-', ' ')}
                </span>
                
                <span className={`text-xs ${
                  isOverdue ? 'text-red-600 font-medium' : 
                  isDueSoon ? 'text-orange-600 font-medium' : 
                  'text-gray-500'
                }`}>
                  Due: {format(dueDate, 'MMM dd, yyyy')}
                  {isOverdue && <span className="ml-1">(Overdue)</span>}
                  {isDueSoon && !isOverdue && <span className="ml-1">(Due soon)</span>}
                </span>
              </div>
              
              {(task.tags.length > 0 || task.assignedTo.length > 0) && (
                <div className="flex items-center space-x-4 mt-2">
                  {task.tags.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <TagIcon className="h-3 w-3 text-gray-400" />
                      <div className="flex space-x-1">
                        {task.tags.slice(0, 2).map((tag, index) => (
                          <span key={index} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                        {task.tags.length > 2 && (
                          <span className="text-xs text-gray-500">+{task.tags.length - 2}</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {task.assignedTo.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <UserGroupIcon className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {task.assignedTo.length} assigned
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => onEdit(task)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(task._id)}
            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </li>
  );
};

export default TaskCard; 