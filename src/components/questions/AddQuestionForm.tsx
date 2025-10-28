/**
 * AddQuestionForm Component
 * Form for adding new research questions
 * @ai-context User input for Phase 2 Q&A system
 */

import React, { useState } from 'react';
import { Button } from '@/components/common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { answerQuestion } from '@/workflows/questionAnswering';
import type { ResearchQuestion } from '@/types/question';

export interface AddQuestionFormProps {
  onQuestionAdded?: (question: ResearchQuestion) => void;
  onCancel?: () => void;
}

export const AddQuestionForm: React.FC<AddQuestionFormProps> = ({
  onQuestionAdded,
  onCancel,
}) => {
  const [questionText, setQuestionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!questionText.trim()) {
      setError('Please enter a question');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const question = await answerQuestion(questionText.trim());
      setQuestionText('');
      onQuestionAdded?.(question);
    } catch (err) {
      console.error('Failed to add question:', err);
      setError('Failed to process question. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ask a Research Question</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="question"
              className="block text-sm font-medium text-secondary-700 mb-2"
            >
              Research Question
            </label>
            <textarea
              id="question"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="e.g., What causes post-exertional malaise?"
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y min-h-[100px]"
              disabled={isSubmitting}
              aria-label="Research question text"
            />
            <p className="mt-1 text-sm text-secondary-500">
              Ask any question about ME/CFS research. The system will search your paper
              collection and synthesize evidence-based answers.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting || !questionText.trim()}>
              {isSubmitting ? 'Processing...' : 'Ask Question'}
            </Button>
          </div>

          {isSubmitting && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                Searching papers and extracting evidence... This may take a moment.
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

