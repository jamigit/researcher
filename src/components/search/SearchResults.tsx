/**
 * SearchResults Component
 * Displays search results with relevance highlighting
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, HelpCircle, Lightbulb } from 'lucide-react';
import { Card } from '@/components/common/Card';
import type { SearchResults as SearchResultsType, SearchResult } from '@/types/search';

export interface SearchResultsProps {
  results: SearchResultsType;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ results }) => {
  const navigate = useNavigate();

  if (results.totalCount === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-secondary-600">No results found for "{results.query.text}"</p>
        <p className="text-sm text-secondary-500 mt-2">
          Try different keywords or adjust your filters
        </p>
      </div>
    );
  }

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'paper') {
      navigate(`/papers/${result.id}`);
    } else if (result.type === 'question') {
      navigate(`/questions/${result.id}`);
    } else if (result.type === 'finding' && result.metadata?.questionId) {
      navigate(`/questions/${result.metadata.questionId}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Results header */}
      <div className="flex items-center justify-between text-sm text-secondary-600">
        <span>
          {results.totalCount} result{results.totalCount !== 1 ? 's' : ''} found
        </span>
        <span>{results.executionTime.toFixed(0)}ms</span>
      </div>

      {/* Results list */}
      <div className="space-y-3">
        {results.results.map((result) => (
          <ResultCard
            key={`${result.type}-${result.id}`}
            result={result}
            onClick={() => handleResultClick(result)}
          />
        ))}
      </div>
    </div>
  );
};

interface ResultCardProps {
  result: SearchResult;
  onClick: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, onClick }) => {
  const getIcon = () => {
    switch (result.type) {
      case 'paper':
        return <FileText className="w-5 h-5 text-blue-600" />;
      case 'question':
        return <HelpCircle className="w-5 h-5 text-green-600" />;
      case 'finding':
        return <Lightbulb className="w-5 h-5 text-purple-600" />;
    }
  };

  const getTypeLabel = () => {
    switch (result.type) {
      case 'paper':
        return 'Paper';
      case 'question':
        return 'Question';
      case 'finding':
        return 'Finding';
    }
  };

  const relevancePercentage = Math.round(result.relevanceScore * 100);

  return (
    <Card
      className="p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1">{getIcon()}</div>

        <div className="flex-1 min-w-0">
          {/* Type badge and relevance */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-secondary-600 uppercase">
              {getTypeLabel()}
            </span>
            {relevancePercentage >= 70 && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                {relevancePercentage}% match
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-secondary-900 mb-1 truncate">
            {result.title}
          </h3>

          {/* Snippet */}
          <p className="text-sm text-secondary-600 line-clamp-2">
            {result.snippet}
          </p>

          {/* Metadata */}
          {result.metadata && (
            <div className="flex flex-wrap gap-2 mt-2 text-xs text-secondary-500">
              {result.type === 'paper' && result.metadata.journal && (
                <span>{result.metadata.journal}</span>
              )}
              {result.type === 'paper' && result.metadata.date && (
                <>
                  <span>•</span>
                  <span>
                    {new Date(result.metadata.date).getFullYear()}
                  </span>
                </>
              )}
              {result.type === 'question' && (
                <>
                  <span>
                    {result.metadata.findingsCount} finding
                    {result.metadata.findingsCount !== 1 ? 's' : ''}
                  </span>
                  <span>•</span>
                  <span>{Math.round(result.metadata.confidence * 100)}% confidence</span>
                </>
              )}
              {result.type === 'finding' && (
                <>
                  <span>{result.metadata.consistency} consistency</span>
                  <span>•</span>
                  <span>
                    {result.metadata.paperCount} paper
                    {result.metadata.paperCount !== 1 ? 's' : ''}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Matched fields */}
          {result.matchedFields.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {result.matchedFields.map((field) => (
                <span
                  key={field}
                  className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded"
                >
                  {field}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

