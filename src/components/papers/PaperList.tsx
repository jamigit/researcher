/**
 * Paper list component
 * @ai-context List container for paper cards with empty states
 */

import React from 'react';
import { FileText } from 'lucide-react';
import { PaperCard } from './PaperCard';
import type { ResearchPaper } from '@/types/paper';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface PaperListProps {
  papers: ResearchPaper[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export const PaperList: React.FC<PaperListProps> = ({
  papers,
  isLoading = false,
  emptyMessage = 'No papers found',
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" text="Loading papers..." />
      </div>
    );
  }

  if (papers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-secondary-100 p-4 rounded-full mb-4">
          <FileText className="h-12 w-12 text-secondary-400" />
        </div>
        <h3 className="text-lg font-medium text-secondary-900 mb-2">No Papers Yet</h3>
        <p className="text-secondary-600 max-w-md">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {papers.map((paper) => (
        <PaperCard key={paper.id} paper={paper} />
      ))}
    </div>
  );
};

