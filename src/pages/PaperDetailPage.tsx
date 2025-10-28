/**
 * Paper detail page
 * @ai-context Full paper view page with routing
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { PaperDetail } from '@/components/papers/PaperDetail';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { usePaper } from '@/hooks/usePapers';

export const PaperDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { paper, isLoading } = usePaper(id!);

  if (isLoading) {
    return <LoadingPage text="Loading paper..." />;
  }

  if (!paper) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">Paper Not Found</h2>
        <p className="text-secondary-600 mb-6">The paper you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/papers')}>
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Papers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate('/papers')}>
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Papers
      </Button>

      {/* Paper Detail */}
      <PaperDetail paper={paper} />
    </div>
  );
};

