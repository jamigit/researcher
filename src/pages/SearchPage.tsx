/**
 * SearchPage
 * Dedicated search page with enhanced features
 */

import React, { useState } from 'react';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';
import { search } from '@/services/search';
import type { SearchResults as SearchResultsType, SearchScope } from '@/types/search';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export const SearchPage: React.FC = () => {
  const [results, setResults] = useState<SearchResultsType | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string, scope: SearchScope) => {
    setIsSearching(true);
    setError(null);

    try {
      const searchResults = await search({
        text: query,
        scope,
      });

      setResults(searchResults);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">Search</h1>
        <p className="text-secondary-600">
          Search across your papers, questions, and findings
        </p>
      </div>

      {/* Search bar */}
      <SearchBar onSearch={handleSearch} />

      {/* Search tips */}
      {!results && !isSearching && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Search Tips:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use multiple keywords to narrow results</li>
            <li>• Search across papers, questions, or both</li>
            <li>• Click on results to view details</li>
            <li>• Use filters to refine by date, type, or status</li>
          </ul>
        </div>
      )}

      {/* Loading state */}
      {isSearching && (
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <p className="text-secondary-600 mt-4">Searching...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Results */}
      {results && !isSearching && <SearchResults results={results} />}
    </div>
  );
};

