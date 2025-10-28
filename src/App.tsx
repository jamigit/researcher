/**
 * Main App component with routing
 * @ai-context Root component with router configuration and layout
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { MobileNavigation } from './components/layout/Navigation';
import { Footer } from './components/layout/Footer';
import { Dashboard } from './pages/Dashboard';
import { PaperFeed } from './pages/PaperFeed';
import { PaperDetailPage } from './pages/PaperDetailPage';
import { QuestionsPage } from './pages/QuestionsPage';
import { QuestionDetailPage } from './pages/QuestionDetailPage';
import { Settings } from './pages/Settings';
import { AddPaperPage } from './pages/AddPaperPage';
import { initializeDatabase } from './services/db';

/**
 * Error boundary for catching React errors
 */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-secondary-50">
          <div className="max-w-md p-8 bg-white rounded-lg shadow-lg text-center">
            <h1 className="text-2xl font-bold text-danger-600 mb-4">Something went wrong</h1>
            <p className="text-secondary-600 mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Main App Layout
 */
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-secondary-50">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        {children}
      </main>
      <Footer />
      <MobileNavigation />
    </div>
  );
};

/**
 * Search page placeholder
 */
const SearchPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Search</h1>
        <p className="text-secondary-600 mt-1">Search functionality coming soon</p>
      </div>
      <div className="bg-white rounded-lg border border-secondary-200 p-12 text-center">
        <p className="text-secondary-600">
          Search and filtering features will be added in the next phase.
        </p>
      </div>
    </div>
  );
};

/**
 * Main App Component
 */
function App() {
  useEffect(() => {
    // Initialize the database on app startup
    initializeDatabase().catch((error) => {
      console.error('Failed to initialize database:', error);
    });

    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
    }
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/papers" element={<PaperFeed />} />
            <Route path="/papers/add" element={<AddPaperPage />} />
            <Route path="/papers/:id" element={<PaperDetailPage />} />
            <Route path="/questions" element={<QuestionsPage />} />
            <Route path="/questions/:id" element={<QuestionDetailPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/settings" element={<Settings />} />
            <Route
              path="*"
              element={
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-secondary-900 mb-2">Page Not Found</h2>
                  <p className="text-secondary-600">The page you're looking for doesn't exist.</p>
                </div>
              }
            />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;

