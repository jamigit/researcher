/**
 * QuestionCard Component
 * Displays a research question summary in list view
 * @ai-context Question card with status indicators and contradiction warnings
 */

import React from 'react';
import { Card, CardContent } from '@/components/common/Card';
import type { ResearchQuestion } from '@/types/question';
import { QuestionStatus } from '@/types/question';
import { AlertTriangle } from 'lucide-react';

export interface QuestionCardProps {
  question: ResearchQuestion;
  onClick?: () => void;
}

const statusConfig = {
  [QuestionStatus.UNANSWERED]: {
    label: 'Unanswered',
    color: 'text-secondary-500',
    bgColor: 'bg-secondary-100',
  },
  [QuestionStatus.PARTIAL]: {
    label: 'Partial Evidence',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
  },
  [QuestionStatus.ANSWERED]: {
    label: 'Answered',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
};

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onClick,
}) => {
  const statusStyle = statusConfig[question.status];
  const hasContradictions = question.contradictions.length > 0;

  return (
    <Card hover onClick={onClick} className="relative">
      <CardContent className="space-y-3">
        {/* Priority badge */}
        {question.isPriority && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
              Priority
            </span>
          </div>
        )}

        {/* Question text */}
        <h3 className="text-lg font-semibold text-secondary-900 pr-16">
          {question.question}
        </h3>

        {/* Status and metadata */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {/* Status badge */}
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium ${statusStyle.bgColor} ${statusStyle.color}`}
          >
            {statusStyle.label}
          </span>

          {/* Paper count */}
          <span className="text-secondary-600">
            {question.paperCount} {question.paperCount === 1 ? 'paper' : 'papers'}
          </span>

          {/* Finding count */}
          {question.findings.length > 0 && (
            <span className="text-secondary-600">
              {question.findings.length}{' '}
              {question.findings.length === 1 ? 'finding' : 'findings'}
            </span>
          )}

          {/* Confidence */}
          {question.confidence > 0 && (
            <span className="text-secondary-600">
              {Math.round(question.confidence * 100)}% confidence
            </span>
          )}
        </div>

        {/* Contradiction warning - VERY PROMINENT */}
        {hasContradictions && (
          <div className="flex items-center gap-2 p-3 bg-yellow-100 border-2 border-yellow-400 rounded-md">
            <AlertTriangle className="w-5 h-5 text-yellow-700 flex-shrink-0" />
            <p className="text-sm font-medium text-yellow-800">
              {question.contradictions.length}{' '}
              {question.contradictions.length === 1
                ? 'contradiction'
                : 'contradictions'}{' '}
              detected in evidence
            </p>
          </div>
        )}

        {/* Last updated */}
        <div className="text-xs text-secondary-500">
          Last updated: {new Date(question.lastUpdated).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
};

