/**
 * Application header component
 * @ai-context Top navigation bar with branding and actions
 */

import React from 'react';
import { BookOpen, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { APP_INFO } from '@/utils/constants';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-secondary-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="bg-primary-600 p-2 rounded-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-secondary-900">{APP_INFO.SHORT_NAME}</h1>
              <p className="text-xs text-secondary-500 hidden sm:block">ME/CFS Research Tracker</p>
            </div>
          </Link>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Offline indicator - will be enhanced with hook */}
            <div className="hidden md:flex items-center space-x-2">
              <div className="h-2 w-2 bg-success-500 rounded-full" />
              <span className="text-sm text-secondary-600">Online</span>
            </div>

            {/* Settings link */}
            <Link
              to="/settings"
              className="p-2 rounded-lg hover:bg-secondary-100 transition-colors"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5 text-secondary-600" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

