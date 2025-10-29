/**
 * SearchBar Component
 * Enhanced search with filters and scope selection
 */

import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { SearchScope } from '@/types/search';

export interface SearchBarProps {
  onSearch: (query: string, scope: SearchScope) => void;
  onOpenFilters?: () => void;
  initialQuery?: string;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onOpenFilters,
  initialQuery = '',
  placeholder = 'Search papers, questions, findings...',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [scope, setScope] = useState<SearchScope>(SearchScope.ALL);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), scope);
    }
  };

  const handleClear = () => {
    setQuery('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-2">
        {/* Search input */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full pl-10 pr-10 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-secondary-900 placeholder-secondary-400"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <Button type="submit" disabled={!query.trim()}>
            Search
          </Button>

          {onOpenFilters && (
            <Button type="button" variant="outline" onClick={onOpenFilters}>
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </Button>
          )}
        </div>

        {/* Scope selector */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setScope(SearchScope.ALL)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              scope === SearchScope.ALL
                ? 'bg-primary-100 text-primary-700'
                : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setScope(SearchScope.PAPERS)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              scope === SearchScope.PAPERS
                ? 'bg-primary-100 text-primary-700'
                : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
            }`}
          >
            Papers
          </button>
          <button
            type="button"
            onClick={() => setScope(SearchScope.QUESTIONS)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              scope === SearchScope.QUESTIONS
                ? 'bg-primary-100 text-primary-700'
                : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
            }`}
          >
            Questions
          </button>
        </div>
      </div>
    </form>
  );
};

