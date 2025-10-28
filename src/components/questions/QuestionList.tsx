/**
 * QuestionList Component
 * Displays list of research questions with filtering
 * @ai-context Main dashboard view for Q&A system
 */

import React, { useState, useMemo } from 'react';
import { QuestionCard } from './QuestionCard';
import { Button } from '@/components/common/Button';
import type { ResearchQuestion } from '@/types/question';
import { QuestionStatus } from '@/types/question';
import { Plus, Filter } from 'lucide-react';

export interface QuestionListProps {
  questions: ResearchQuestion[];
  onQuestionClick: (question: ResearchQuestion) => void;
  onAddQuestion: () => void;
}

type FilterStatus = 'all' | QuestionStatus;

export const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  onQuestionClick,
  onAddQuestion,
}) => {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [showOnlyPriority, setShowOnlyPriority] = useState(false);
  const [showOnlyWithContradictions, setShowOnlyWithContradictions] = useState(false);

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (filterStatus !== 'all' && q.status !== filterStatus) return false;
      if (showOnlyPriority && !q.isPriority) return false;
      if (showOnlyWithContradictions && q.contradictions.length === 0)
        return false;
      return true;
    });
  }, [questions, filterStatus, showOnlyPriority, showOnlyWithContradictions]);

  // Sort by priority, then by last updated
  const sortedQuestions = useMemo(() => {
    return [...filteredQuestions].sort((a, b) => {
      // Priority first
      if (a.isPriority && !b.isPriority) return -1;
      if (!a.isPriority && b.isPriority) return 1;
      // Then by last updated (newest first)
      return (
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      );
    });
  }, [filteredQuestions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">
            Research Questions
          </h1>
          <p className="text-secondary-600 mt-1">
            {questions.length} {questions.length === 1 ? 'question' : 'questions'}
            {filteredQuestions.length !== questions.length &&
              ` (${filteredQuestions.length} shown)`}
          </p>
        </div>
        <Button onClick={onAddQuestion} className="gap-2">
          <Plus className="w-4 h-4" />
          Ask Question
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 p-4 bg-secondary-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-secondary-600" />
          <span className="text-sm font-medium text-secondary-700">Filter:</span>
        </div>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
          className="px-3 py-1 text-sm border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500"
          aria-label="Filter by status"
        >
          <option value="all">All Status</option>
          <option value={QuestionStatus.UNANSWERED}>Unanswered</option>
          <option value={QuestionStatus.PARTIAL}>Partial Evidence</option>
          <option value={QuestionStatus.ANSWERED}>Answered</option>
        </select>

        {/* Priority filter */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showOnlyPriority}
            onChange={(e) => setShowOnlyPriority(e.target.checked)}
            className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-secondary-700">Priority only</span>
        </label>

        {/* Contradictions filter */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showOnlyWithContradictions}
            onChange={(e) => setShowOnlyWithContradictions(e.target.checked)}
            className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-secondary-700">With contradictions</span>
        </label>
      </div>

      {/* Question list */}
      {sortedQuestions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-secondary-600 mb-4">
            {questions.length === 0
              ? 'No research questions yet'
              : 'No questions match your filters'}
          </p>
          {questions.length === 0 && (
            <Button onClick={onAddQuestion} className="gap-2">
              <Plus className="w-4 h-4" />
              Ask Your First Question
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedQuestions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              onClick={() => onQuestionClick(question)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

