/**
 * Paper card component for list views
 * @ai-context Compact card display for research papers
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, User, Tag, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/common/Card';
import type { ResearchPaper } from '@/types/paper';
import { formatDate, formatAuthors, truncateText, enumToLabel } from '@/utils/formatting';
import { READ_STATUSES, IMPORTANCE_LEVELS } from '@/utils/constants';

interface PaperCardProps {
  paper: ResearchPaper;
}

export const PaperCard: React.FC<PaperCardProps> = ({ paper }) => {
  const navigate = useNavigate();

  const readStatusConfig = READ_STATUSES.find((s) => s.value === paper.readStatus);
  const importanceConfig = IMPORTANCE_LEVELS.find((i) => i.value === paper.importance);

  const handleClick = () => {
    navigate(`/papers/${paper.id}`);
  };

  return (
    <Card hover padding="md" onClick={handleClick}>
      <CardContent>
        <div className="space-y-3">
          {/* Header: Status and Importance */}
          <div className="flex items-center justify-between">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${readStatusConfig?.color}`}
            >
              {readStatusConfig?.label}
            </span>
            <span className={`text-xs font-medium ${importanceConfig?.color}`}>
              {importanceConfig?.label}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-secondary-900 line-clamp-2 hover:text-primary-600 transition-colors">
            {paper.title}
          </h3>

          {/* Authors and Date */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-secondary-600">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{formatAuthors(paper.authors, 2)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(paper.publicationDate)}</span>
            </div>
          </div>

          {/* Abstract preview */}
          <p className="text-sm text-secondary-700 line-clamp-3">
            {truncateText(paper.abstract, 200)}
          </p>

          {/* Categories and Tags */}
          <div className="flex flex-wrap gap-2">
            {paper.categories.slice(0, 3).map((category) => (
              <span
                key={category}
                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-primary-50 text-primary-700"
              >
                {enumToLabel(category)}
              </span>
            ))}
            {paper.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-secondary-100 text-secondary-700"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>

          {/* Footer: Journal and External Link */}
          <div className="flex items-center justify-between pt-2 border-t border-secondary-200">
            <span className="text-xs text-secondary-600">
              {paper.journal || 'Unknown Journal'}
            </span>
            {paper.url && (
              <a
                href={paper.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-primary-600 hover:text-primary-700 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

