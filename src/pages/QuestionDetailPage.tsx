/**
 * QuestionDetailPage Component
 * Full detail view of a single research question with all findings
 * @ai-context Question detail page with routing
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { QuestionDetail } from '@/components/questions/QuestionDetail';
import { LoadingPage } from '@/components/common/LoadingSpinner';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/services/db';

export const QuestionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const question = useLiveQuery(
    async () => {
      if (!id) return null;
      return await db.questions.get(id);
    },
    [id]
  );

  if (question === undefined) {
    return <LoadingPage text="Loading question..." />;
  }

  if (!question) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h2 className="text-2xl font-bold text-secondary-900 mb-2">Question Not Found</h2>
        <p className="text-secondary-600 mb-6">
          The question you're looking for doesn't exist.
        </p>
        <Button onClick={() => navigate('/questions')}>
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Questions
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate('/questions')}>
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Questions
      </Button>

      {/* Question Detail */}
      <QuestionDetail question={question} onBack={() => navigate('/questions')} />
    </div>
  );
};

