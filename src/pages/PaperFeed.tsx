/**
 * Paper feed page - list of all papers
 * @ai-context Main papers list with filtering and sorting
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { PaperList } from '@/components/papers/PaperList';
import { usePapers } from '@/hooks/usePapers';
import { ReadStatus, Importance, Category } from '@/types/paper';
import { READ_STATUSES, IMPORTANCE_LEVELS, CATEGORIES } from '@/utils/constants';

export const PaperFeed: React.FC = () => {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [readStatusFilter, setReadStatusFilter] = useState<ReadStatus | undefined>(undefined);
  const [importanceFilter, setImportanceFilter] = useState<Importance | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState<Category | undefined>(undefined);

  const { papers, isLoading } = usePapers({
    readStatus: readStatusFilter,
    importance: importanceFilter,
    category: categoryFilter,
  });

  const clearFilters = () => {
    setReadStatusFilter(undefined);
    setImportanceFilter(undefined);
    setCategoryFilter(undefined);
  };

  const hasActiveFilters = readStatusFilter || importanceFilter || categoryFilter;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Papers</h1>
          <p className="text-secondary-600 mt-1">
            {papers.length} {papers.length === 1 ? 'paper' : 'papers'} in your collection
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </Button>
          <Button onClick={() => navigate('/papers/add')}>
            <Plus className="h-5 w-5 mr-2" />
            Add Paper
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg border border-secondary-200 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-secondary-900">Filters</h2>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            )}
          </div>

          {/* Read Status Filter */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Read Status
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setReadStatusFilter(undefined)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  !readStatusFilter
                    ? 'bg-primary-600 text-white'
                    : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                }`}
              >
                All
              </button>
              {READ_STATUSES.map((status) => (
                <button
                  key={status.value}
                  onClick={() => setReadStatusFilter(status.value)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    readStatusFilter === status.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Importance Filter */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Importance
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setImportanceFilter(undefined)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  !importanceFilter
                    ? 'bg-primary-600 text-white'
                    : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                }`}
              >
                All
              </button>
              {IMPORTANCE_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setImportanceFilter(level.value)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    importanceFilter === level.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategoryFilter(undefined)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  !categoryFilter
                    ? 'bg-primary-600 text-white'
                    : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                }`}
              >
                All
              </button>
              {CATEGORIES.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setCategoryFilter(category.value)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    categoryFilter === category.value
                      ? 'bg-primary-600 text-white'
                      : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Paper List */}
      <PaperList papers={papers} isLoading={isLoading} />
    </div>
  );
};

