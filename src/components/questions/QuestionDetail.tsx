/**
 * QuestionDetail Component
 * Full detail view of a research question with findings and evidence
 * @ai-context Detailed evidence presentation with conservative language
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { ContradictionBox } from './ContradictionBox';
import type { ResearchQuestion } from '@/types/question';
import type { Finding } from '@/types/finding';
import { QuestionStatus } from '@/types/question';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export interface QuestionDetailProps {
  question: ResearchQuestion;
  onBack?: () => void;
}

const statusIcons = {
  [QuestionStatus.UNANSWERED]: AlertCircle,
  [QuestionStatus.PARTIAL]: Clock,
  [QuestionStatus.ANSWERED]: CheckCircle2,
};

const statusColors = {
  [QuestionStatus.UNANSWERED]: 'text-secondary-500',
  [QuestionStatus.PARTIAL]: 'text-yellow-600',
  [QuestionStatus.ANSWERED]: 'text-green-600',
};

export const QuestionDetail: React.FC<QuestionDetailProps> = ({
  question,
  onBack,
}) => {
  const StatusIcon = statusIcons[question.status];

  return (
    <div className="space-y-6">
      {/* Header */}
      {onBack && (
        <button
          onClick={onBack}
          className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
        >
          ← Back to questions
        </button>
      )}

      {/* Question title */}
      <div>
        <div className="flex items-start gap-3 mb-3">
          <StatusIcon className={`w-6 h-6 mt-1 ${statusColors[question.status]}`} />
          <h1 className="text-3xl font-bold text-secondary-900">
            {question.question}
          </h1>
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-secondary-600">
          <span>
            {question.paperCount} {question.paperCount === 1 ? 'paper' : 'papers'}
          </span>
          <span>•</span>
          <span>
            {question.findings.length}{' '}
            {question.findings.length === 1 ? 'finding' : 'findings'}
          </span>
          <span>•</span>
          <span>{Math.round(question.confidence * 100)}% confidence</span>
          <span>•</span>
          <span>Updated {new Date(question.lastUpdated).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Contradictions - VERY PROMINENT */}
      {question.contradictions.map((contradiction) => (
        <ContradictionBox key={contradiction.id} contradiction={contradiction} />
      ))}

      {/* Findings */}
      {question.findings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Evidence & Findings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {question.findings.map((finding, index) => (
              <FindingSection key={finding.id} finding={finding} index={index + 1} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Gaps */}
      {question.gaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              What We Don't Know
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {question.gaps.map((gap, index) => (
                <li key={index} className="text-secondary-700 flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>{gap}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* No evidence yet */}
      {question.findings.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
              No Evidence Yet
            </h3>
            <p className="text-secondary-600">
              No papers in your collection address this question.
              {question.paperCount === 0 &&
                ' Try adding more papers related to this topic.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

/**
 * FindingSection - displays a single finding with details
 */
interface FindingSectionProps {
  finding: Finding;
  index: number;
}

const FindingSection: React.FC<FindingSectionProps> = ({ finding, index }) => {
  const consistencyColors = {
    high: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-red-100 text-red-800',
  };

  return (
    <div className="border-l-4 border-primary-500 pl-4">
      <div className="flex items-start justify-between gap-4 mb-2">
        <h3 className="font-semibold text-secondary-900">
          Finding {index}: {finding.description}
        </h3>
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${consistencyColors[finding.consistency]}`}
        >
          {finding.consistency} consistency
        </span>
      </div>

      {/* Evidence */}
      {(finding.quantitativeResult || finding.qualitativeResult) && (
        <div className="mb-3 p-3 bg-blue-50 rounded-md">
          <p className="text-sm font-medium text-blue-900 mb-1">Evidence:</p>
          <p className="text-sm text-blue-800">
            {finding.quantitativeResult || finding.qualitativeResult}
          </p>
        </div>
      )}

      {/* Study details */}
      <div className="flex flex-wrap gap-3 text-sm text-secondary-600 mb-2">
        <span>
          {finding.supportingPapers.length}{' '}
          {finding.supportingPapers.length === 1 ? 'paper' : 'papers'}
        </span>

        {finding.peerReviewedCount > 0 && (
          <>
            <span>•</span>
            <span>
              {finding.peerReviewedCount} peer-reviewed
            </span>
          </>
        )}

        {finding.preprintCount > 0 && (
          <>
            <span>•</span>
            <span className="text-yellow-600">
              {finding.preprintCount} preprint{finding.preprintCount > 1 ? 's' : ''}
            </span>
          </>
        )}

        {finding.studyTypes.length > 0 && (
          <>
            <span>•</span>
            <span>{finding.studyTypes.join(', ')}</span>
          </>
        )}

        {finding.sampleSizes.length > 0 && (
          <>
            <span>•</span>
            <span>
              Sample sizes:{' '}
              {finding.sampleSizes.map((s) => `n=${s}`).join(', ')}
            </span>
          </>
        )}
      </div>

      {/* Quality assessment */}
      {finding.qualityAssessment && (
        <p className="text-sm text-secondary-600 italic">
          {finding.qualityAssessment}
        </p>
      )}

      {/* Contradiction warning */}
      {finding.hasContradiction && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800 font-medium">
            ⚠️ This finding is contradicted by other research
          </p>
        </div>
      )}
    </div>
  );
};

