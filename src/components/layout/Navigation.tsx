/**
 * Main navigation component
 * @ai-context Side navigation or mobile menu for app sections
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FileText, Settings, Search } from 'lucide-react';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const navItems: NavItem[] = [
  {
    to: '/',
    icon: <Home className="h-5 w-5" />,
    label: 'Dashboard',
  },
  {
    to: '/papers',
    icon: <FileText className="h-5 w-5" />,
    label: 'Papers',
  },
  {
    to: '/search',
    icon: <Search className="h-5 w-5" />,
    label: 'Search',
  },
  {
    to: '/settings',
    icon: <Settings className="h-5 w-5" />,
    label: 'Settings',
  },
];

export const Navigation: React.FC = () => {
  return (
    <nav className="bg-white border-r border-secondary-200 h-full">
      <div className="p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

/**
 * Mobile bottom navigation
 */
export const MobileNavigation: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-secondary-200 md:hidden z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full space-y-1 ${
                isActive ? 'text-primary-600' : 'text-secondary-600'
              }`
            }
          >
            {item.icon}
            <span className="text-xs">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

