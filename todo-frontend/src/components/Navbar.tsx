import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  HomeIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Generate user initials
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Generate avatar background color based on user name
  const getAvatarColor = (firstName: string, lastName: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-teal-500',
    ];
    const name = firstName + lastName;
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const avatarColor = getAvatarColor(user?.firstName || '', user?.lastName || '');
  const userInitials = getInitials(user?.firstName || '', user?.lastName || '');

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-xl font-bold text-gray-900">TodoApp</span>
            </Link>
            <div className="hidden md:ml-8 md:flex md:space-x-6">
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <HomeIcon className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/profile"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <UserIcon className="h-4 w-4" />
                <span>Profile</span>
              </Link>
            </div>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className={`h-8 w-8 rounded-full ${avatarColor} flex items-center justify-center text-white text-sm font-semibold`}>
                {userInitials}
              </div>
              <div className="text-sm">
                <p className="text-gray-900 font-medium">{user?.firstName} {user?.lastName}</p>
                <p className="text-gray-500">@{user?.username}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 text-sm font-medium flex items-center space-x-2"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-gray-900 focus:outline-none focus:text-gray-900 transition-colors duration-200"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/dashboard"
              className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 flex items-center space-x-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <HomeIcon className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/profile"
              className="text-gray-700 hover:text-blue-600 block px-3 py-2 rounded-lg text-base font-medium transition-colors duration-200 flex items-center space-x-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <UserIcon className="h-4 w-4" />
              <span>Profile</span>
            </Link>
          </div>
          
          {/* Mobile User Info */}
          <div className="px-4 py-3 border-t border-gray-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className={`h-10 w-10 rounded-full ${avatarColor} flex items-center justify-center text-white font-semibold`}>
                {userInitials}
              </div>
              <div>
                <p className="text-gray-900 font-medium">{user?.firstName} {user?.lastName}</p>
                <p className="text-gray-500 text-sm">@{user?.username}</p>
              </div>
            </div>
            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 text-sm font-medium flex items-center justify-center space-x-2"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 