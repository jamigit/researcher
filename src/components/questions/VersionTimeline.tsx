/**
 * VersionTimeline Component
 * Shows version history of a question with side-by-side comparison
 * @ai-context Phase 4 - Question version tracking and comparison
 */

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Calendar, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { db } from '@/services/db';
import { getQuestionVersions } from '@/services/questions';
import type { QuestionVersion } from '@/types/question';
import { QuestionStatus } from '@/types/question';

export interface VersionTimelineProps {
  questionId: string;
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

export const VersionTimeline: React.FC<VersionTimelineProps> = ({
  questionId,
}) => {
  const question = useLiveQuery(
    async () => await db.questions.get(questionId),
    [questionId]
  );

  const versions = useLiveQuery(
    async () => await getQuestionVersions(questionId),
    [questionId]
  );

  // Always compare current version with previous (if exists)
  const [selectedVersions, setSelectedVersions] = useState<number[]>([]);

  // Update selected versions when question loads
  React.useEffect(() => {
    if (question && versions) {
      const current = question.currentVersion;
      const previous = current - 1;
      setSelectedVersions(
        previous >= 1 ? [current, previous] : [current]
      );
    }
  }, [question, versions]);

  if (!question || !versions) {
    return <div>Loading...</div>;
  }

  // Build full version list (historical + current)
  const allVersions: QuestionVersion[] = [
    ...versions,
    {
      id: crypto.randomUUID(),
      versionNumber: question.currentVersion,
      dateGenerated: question.lastUpdated,
      findings: question.findings,
      contradictions: question.contradictions,
      paperCount: question.paperCount,
      confidence: question.confidence,
      status: question.status,
      papersUsed: question.papersUsed,
    },
  ];

  const toggleVersionSelection = (versionNum: number) => {
    if (selectedVersions.includes(versionNum)) {
      // Deselect (but keep at least one selected)
      if (selectedVersions.length > 1) {
        setSelectedVersions(selectedVersions.filter((v) => v !== versionNum));
      }
    } else {
      // Select (max 2 versions for comparison)
      if (selectedVersions.length >= 2) {
        setSelectedVersions([selectedVersions[0], versionNum]);
      } else {
        setSelectedVersions([...selectedVersions, versionNum]);
      }
    }
  };

  const selectedVersionData = allVersions.filter((v) =>
    selectedVersions.includes(v.versionNumber)
  );

  // Sort selected versions by version number
  selectedVersionData.sort((a, b) => b.versionNumber - a.versionNumber);

  return (
    <div className="space-y-6">
      {/* Timeline selector */}
      <Card>
        <CardHeader>
          <CardTitle>Answer Version History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-secondary-600 mb-4">
            Select up to 2 versions to compare side-by-side
          </p>
          <div className="flex flex-wrap gap-2">
            {allVersions
              .slice()
              .reverse()
              .map((version) => {
                const isSelected = selectedVersions.includes(
                  version.versionNumber
                );
                const isCurrent =
                  version.versionNumber === question.currentVersion;
                return (
                  <button
                    key={version.id}
                    onClick={() => toggleVersionSelection(version.versionNumber)}
                    className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-secondary-700 border-secondary-300 hover:border-primary-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <div className="text-left">
                        <div>
                          Version {version.versionNumber}
                          {isCurrent && (
                            <span className="ml-1 text-xs">(current)</span>
                          )}
                        </div>
                        <div className="text-xs opacity-90">
                          {new Date(version.dateGenerated).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Side-by-side comparison */}
      {selectedVersionData.length > 0 && (
        <div
          className={`grid gap-4 ${
            selectedVersionData.length === 2 ? 'grid-cols-2' : 'grid-cols-1'
          }`}
        >
          {selectedVersionData.map((version) => (
            <VersionCard key={version.id} version={version} />
          ))}
        </div>
      )}
    </div>
  );
};

interface VersionCardProps {
  version: QuestionVersion;
}

const VersionCard: React.FC<VersionCardProps> = ({ version }) => {
  const StatusIcon = statusIcons[version.status];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Version {version.versionNumber}</CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <StatusIcon className={`w-5 h-5 ${statusColors[version.status]}`} />
            <span className="text-secondary-600">{version.status}</span>
          </div>
        </div>
        <p className="text-sm text-secondary-600 mt-1">
          Generated {new Date(version.dateGenerated).toLocaleString()}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 p-3 bg-secondary-50 rounded-md">
          <div>
            <div className="text-2xl font-bold text-secondary-900">
              {version.findings.length}
            </div>
            <div className="text-xs text-secondary-600">Findings</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-secondary-900">
              {version.paperCount}
            </div>
            <div className="text-xs text-secondary-600">Papers</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-secondary-900">
              {Math.round(version.confidence * 100)}%
            </div>
            <div className="text-xs text-secondary-600">Confidence</div>
          </div>
        </div>

        {/* Contradictions */}
        {version.contradictions.length > 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm font-medium text-yellow-900">
              {version.contradictions.length} contradiction
              {version.contradictions.length !== 1 && 's'} detected
            </p>
          </div>
        )}

        {/* Findings list */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-secondary-900">
            Findings:
          </h4>
          {version.findings.length > 0 ? (
            version.findings.map((finding, idx) => (
              <div
                key={finding.id}
                className="p-3 bg-white border border-secondary-200 rounded-md"
              >
                <p className="text-sm text-secondary-900">
                  <strong>Finding {idx + 1}:</strong> {finding.description}
                </p>
                <p className="text-xs text-secondary-600 mt-1">
                  {finding.supportingPapers.length} paper
                  {finding.supportingPapers.length !== 1 && 's'} • {finding.consistency} consistency
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-secondary-500 italic">
              No findings in this version
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

