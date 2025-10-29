/**
 * RefreshButton Component
 * Allows users to regenerate question answers with new papers
 * @ai-context Phase 4 - Question refresh with version tracking
 */

import React from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/common/Button';

export interface RefreshButtonProps {
  questionId: string;
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
  disabled?: boolean;
}

export const RefreshButton: React.FC<RefreshButtonProps> = ({
  onRefresh,
  isRefreshing,
  disabled = false,
}) => {
  const handleClick = async () => {
    if (!isRefreshing && !disabled) {
      await onRefresh();
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isRefreshing || disabled}
      variant="outline"
      className="flex items-center gap-2"
      title="Refresh answer with latest papers"
    >
      {isRefreshing ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Regenerating...</span>
        </>
      ) : (
        <>
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Answer</span>
        </>
      )}
    </Button>
  );
};

