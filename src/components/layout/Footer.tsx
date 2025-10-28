/**
 * Application footer component
 * @ai-context Footer with app information and links
 */

import React from 'react';
import { APP_INFO } from '@/utils/constants';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-secondary-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* App Info */}
          <div className="text-center md:text-left">
            <p className="text-sm text-secondary-600">
              {APP_INFO.NAME} v{APP_INFO.VERSION}
            </p>
            <p className="text-xs text-secondary-500 mt-1">{APP_INFO.DESCRIPTION}</p>
          </div>

          {/* Links */}
          <div className="flex space-x-6">
            <a
              href={APP_INFO.GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-secondary-600 hover:text-primary-600 transition-colors"
            >
              GitHub
            </a>
            <a
              href="/about"
              className="text-sm text-secondary-600 hover:text-primary-600 transition-colors"
            >
              About
            </a>
            <a
              href="/privacy"
              className="text-sm text-secondary-600 hover:text-primary-600 transition-colors"
            >
              Privacy
            </a>
          </div>

          {/* Copyright */}
          <div className="text-center md:text-right">
            <p className="text-xs text-secondary-500">
              © {currentYear} {APP_INFO.AUTHOR}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

