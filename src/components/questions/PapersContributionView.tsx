/**
 * PapersContributionView Component
 * Shows all papers and their contributions to a question's answer
 * @ai-context Phase 4 - Transparency in paper contributions
 */

import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { CheckCircle2, XCircle, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/common/Card';
import { db } from '@/services/db';
import type { ResearchPaper } from '@/types/paper';
import type { Finding } from '@/types/finding';

export interface PapersContributionViewProps {
  questionId: string;
}

interface PaperWithContribution extends ResearchPaper {
  wasUsed: boolean;
  findings: Finding[];
}

export const PapersContributionView: React.FC<PapersContributionViewProps> = ({
  questionId,
}) => {
  // Load question to see which papers were used
  const question = useLiveQuery(
    async () => await db.questions.get(questionId),
    [questionId]
  );

  // Load all papers
  const allPapers = useLiveQuery(async () => await db.papers.toArray(), []);

  if (!question || !allPapers) {
    return <div>Loading...</div>;
  }

  // Categorize papers by whether they contributed
  const papersWithContribution: PaperWithContribution[] = allPapers.map(
    (paper) => {
      const wasUsed = question.papersUsed.includes(paper.id);
      const findings = question.findings.filter((f) =>
        f.supportingPapers.includes(paper.id)
      );
      return { ...paper, wasUsed, findings };
    }
  );

  // Sort: used papers first, then by date
  papersWithContribution.sort((a, b) => {
    if (a.wasUsed !== b.wasUsed) {
      return a.wasUsed ? -1 : 1;
    }
    return (
      new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
    );
  });

  const usedCount = papersWithContribution.filter((p) => p.wasUsed).length;
  const notUsedCount = papersWithContribution.length - usedCount;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-secondary-900">
                Paper Analysis Summary
              </h3>
              <p className="text-sm text-secondary-600 mt-1">
                How papers in your collection contributed to this answer
              </p>
            </div>
            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span>
                  <strong>{usedCount}</strong> contributed
                </span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-secondary-400" />
                <span>
                  <strong>{notUsedCount}</strong> not relevant
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Papers list */}
      <div className="space-y-3">
        {papersWithContribution.map((paper) => (
          <PaperContributionCard
            key={paper.id}
            paper={paper}
            wasUsed={paper.wasUsed}
            findings={paper.findings}
          />
        ))}
      </div>
    </div>
  );
};

interface PaperContributionCardProps {
  paper: ResearchPaper;
  wasUsed: boolean;
  findings: Finding[];
}

const PaperContributionCard: React.FC<PaperContributionCardProps> = ({
  paper,
  wasUsed,
  findings,
}) => {
  return (
    <Card className={wasUsed ? 'border-l-4 border-green-500' : ''}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          {/* Status icon */}
          <div className="flex-shrink-0 mt-1">
            {wasUsed ? (
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            ) : (
              <XCircle className="w-6 h-6 text-secondary-300" />
            )}
          </div>

          {/* Paper details */}
          <div className="flex-1">
            <h4 className="font-semibold text-secondary-900 mb-1">
              {paper.title}
            </h4>
            
            {paper.authors && paper.authors.length > 0 && (
              <p className="text-sm text-secondary-600 mb-2">
                {paper.authors.slice(0, 3).join(', ')}
                {paper.authors.length > 3 && ` et al.`}
              </p>
            )}

            {paper.journal && paper.publicationDate && (
              <p className="text-sm text-secondary-500 mb-2">
                {paper.journal} •{' '}
                {new Date(paper.publicationDate).getFullYear()}
              </p>
            )}

            {/* Contribution details */}
            {wasUsed ? (
              <div className="mt-3 p-3 bg-green-50 rounded-md">
                <p className="text-sm font-medium text-green-900 mb-2">
                  Contributed to {findings.length}{' '}
                  {findings.length === 1 ? 'finding' : 'findings'}:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  {findings.map((finding) => (
                    <li key={finding.id} className="text-sm text-green-800">
                      {finding.description}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="mt-3 p-3 bg-secondary-50 rounded-md">
                <p className="text-sm text-secondary-600">
                  Not relevant to this question
                </p>
              </div>
            )}
          </div>

          {/* Link icon */}
          <div className="flex-shrink-0">
            <a
              href={`#/papers/${paper.id}`}
              className="text-primary-600 hover:text-primary-700"
              title="View paper details"
            >
              <FileText className="w-5 h-5" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

