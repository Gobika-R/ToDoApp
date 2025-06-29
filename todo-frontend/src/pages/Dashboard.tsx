import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { tasksAPI } from '../services/api';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import TaskFilters from '../components/TaskFilters';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

interface Task {
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
}

interface Filters {
  status: string;
  priority: string;
  search: string;
}

const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filters, setFilters] = useState<Filters>({
    status: '',
    priority: '',
    search: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.search) params.search = filters.search;

      const response = await tasksAPI.getAll(params);
      setTasks(response.data.tasks);
    } catch (error: any) {
      toast.error('Failed to fetch tasks');
      console.error('Fetch tasks error:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreateTask = async (taskData: any) => {
    try {
      const response = await tasksAPI.create(taskData);
      setTasks([response.data.task, ...tasks]);
      setShowTaskModal(false);
      toast.success('Task created successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleUpdateTask = async (taskId: string, taskData: any) => {
    try {
      const response = await tasksAPI.update(taskId, taskData);
      setTasks(tasks.map(task => 
        task._id === taskId ? response.data.task : task
      ));
      setShowTaskModal(false);
      setEditingTask(null);
      toast.success('Task updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await tasksAPI.delete(taskId);
      setTasks(tasks.filter(task => task._id !== taskId));
      toast.success('Task deleted successfully!');
    } catch (error: any) {
      toast.error('Failed to delete task');
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const response = await tasksAPI.complete(taskId);
      setTasks(tasks.map(task => 
        task._id === taskId ? response.data.task : task
      ));
      toast.success('Task marked as completed!');
    } catch (error: any) {
      toast.error('Failed to complete task');
    }
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const closeModal = () => {
    setShowTaskModal(false);
    setEditingTask(null);
  };

  const filteredTasks = tasks.filter(task => {
    if (filters.status && task.status !== filters.status) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  // Smart task sorting function
  const sortTasks = (tasks: Task[]) => {
    return tasks.sort((a, b) => {
      // Calculate days until due for both tasks
      const today = new Date();
      const dueDateA = new Date(a.dueDate);
      const dueDateB = new Date(b.dueDate);
      const daysUntilDueA = Math.ceil((dueDateA.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const daysUntilDueB = Math.ceil((dueDateB.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // Check if tasks are overdue
      const isOverdueA = daysUntilDueA < 0 && a.status !== 'completed';
      const isOverdueB = daysUntilDueB < 0 && b.status !== 'completed';

      // Priority weights (higher number = higher priority)
      const getPriorityWeight = (priority: string) => {
        switch (priority) {
          case 'urgent': return 5;
          case 'high': return 4;
          case 'medium': return 3;
          case 'low': return 2;
          default: return 1;
        }
      };

      // Status weights (higher number = higher priority)
      const getStatusWeight = (status: string) => {
        switch (status) {
          case 'in-progress': return 4;
          case 'review': return 3;
          case 'todo': return 2;
          case 'completed': return 1;
          default: return 0;
        }
      };

      // Get priority weights
      let priorityWeightA = getPriorityWeight(a.priority);
      let priorityWeightB = getPriorityWeight(b.priority);

      // Auto-upgrade priority to high if due in 2 days or less (and not completed)
      if (daysUntilDueA <= 2 && daysUntilDueA >= 0 && a.status !== 'completed') {
        priorityWeightA = Math.max(priorityWeightA, getPriorityWeight('high'));
      }
      if (daysUntilDueB <= 2 && daysUntilDueB >= 0 && b.status !== 'completed') {
        priorityWeightB = Math.max(priorityWeightB, getPriorityWeight('high'));
      }

      // Sort by priority (overdue tasks first, then by priority weight)
      if (isOverdueA && !isOverdueB) return -1;
      if (!isOverdueA && isOverdueB) return 1;
      if (isOverdueA && isOverdueB) {
        // If both overdue, sort by how overdue they are (most overdue first)
        return daysUntilDueA - daysUntilDueB;
      }

      // Sort by priority weight (higher first)
      if (priorityWeightA !== priorityWeightB) {
        return priorityWeightB - priorityWeightA;
      }

      // If same priority, sort by status (in-progress first, then review, then todo)
      const statusWeightA = getStatusWeight(a.status);
      const statusWeightB = getStatusWeight(b.status);
      if (statusWeightA !== statusWeightB) {
        return statusWeightB - statusWeightA;
      }

      // If same status, sort by due date (earliest first)
      return daysUntilDueA - daysUntilDueB;
    });
  };

  const sortedTasks = sortTasks(filteredTasks);

  const stats = {
    total: tasks.length,
    completed: tasks.filter(task => task.status === 'completed').length,
    overdue: tasks.filter(task => task.isOverdue && task.status !== 'completed').length,
    inProgress: tasks.filter(task => task.status === 'in-progress').length,
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your tasks and stay organized</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{stats.total}</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{stats.completed}</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{stats.overdue}</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{stats.inProgress}</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {sortedTasks.length} task{sortedTasks.length !== 1 ? 's' : ''} total
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex space-x-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <FunnelIcon className="h-4 w-4 mr-2" />
                  Filters
                </button>
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Task
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <TaskFilters filters={filters} onFiltersChange={setFilters} onClose={() => setShowFilters(false)} />
            </div>
          )}

          {/* Tasks List */}
          <div className="divide-y divide-gray-100">
            {sortedTasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                <p className="text-gray-500 mb-4">
                  {filters.status || filters.priority || filters.search
                    ? 'Try adjusting your filters to see more tasks.'
                    : 'Get started by creating your first task.'}
                </p>
                {!filters.status && !filters.priority && !filters.search && (
                  <button
                    onClick={() => setShowTaskModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create Task
                  </button>
                )}
              </div>
            ) : (
              sortedTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={openEditModal}
                  onDelete={handleDeleteTask}
                  onComplete={handleCompleteTask}
                />
              ))
            )}
          </div>
        </div>

        {/* Task Modal */}
        {showTaskModal && (
          <TaskModal
            task={editingTask}
            onSave={(taskId, data) => {
              if (taskId) {
                handleUpdateTask(taskId, data);
              } else {
                handleCreateTask(data);
              }
            }}
            onClose={closeModal}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard; 