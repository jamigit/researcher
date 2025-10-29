/**
 * QuestionDetail Component
 * Full detail view of a research question with findings and evidence
 * @ai-context Detailed evidence presentation with conservative language
 */

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/common/Tabs';
import { ContradictionBox } from './ContradictionBox';
import { NotesEditor } from './NotesEditor';
import { Citation } from '@/components/papers/Citation';
import { MechanismBadge } from './MechanismBadge';
import { MechanismExplainerModal } from './MechanismExplainerModal';
import { ExportButton } from './ExportButton';
import { RefreshButton } from './RefreshButton';
import { PapersContributionView } from './PapersContributionView';
import { VersionTimeline } from './VersionTimeline';
import { updateFindingNotes } from '@/services/questions';
import { getExplainerByMechanism, createExplainer } from '@/services/explainers';
import { generateExplainer } from '@/tools/MechanismExplainer';
import { refreshQuestion } from '@/workflows/questionAnswering';
import { detectMechanismsInText } from '@/types/mechanism';
import { db } from '@/services/db';
import type { ResearchQuestion } from '@/types/question';
import type { Finding } from '@/types/finding';
import type { MechanismExplainer } from '@/types/mechanism';
import { QuestionStatus } from '@/types/question';
import { AlertCircle, CheckCircle2, Clock, FileText, Edit3, Trash2, BookOpen, Info } from 'lucide-react';

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshQuestion(question.id);
    } catch (error) {
      console.error('Failed to refresh question:', error);
      alert('Failed to refresh question. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

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
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3">
            <StatusIcon className={`w-6 h-6 mt-1 ${statusColors[question.status]}`} />
            <h1 className="text-3xl font-bold text-secondary-900">
              {question.question}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <RefreshButton
              questionId={question.id}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
            />
            <ExportButton questionId={question.id} />
          </div>
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

      {/* Tabs for different views */}
      <Tabs defaultValue="findings">
        <TabsList>
          <TabsTrigger value="findings">Current Answer</TabsTrigger>
          <TabsTrigger value="papers">
            All Papers ({question.paperCount})
          </TabsTrigger>
          <TabsTrigger value="timeline">
            Version History ({(question.versions?.length || 0) + 1})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="findings">
          {/* Contradictions - VERY PROMINENT */}
          {question.contradictions.map((contradiction) => (
            <ContradictionBox key={contradiction.id} contradiction={contradiction} />
          ))}

          {/* Orphaned notes (notes from findings that no longer exist) */}
          {question.orphanedNotes && question.orphanedNotes.length > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Info className="w-5 h-5" />
                  Preserved Notes from Previous Version
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-blue-800 mb-3">
                  These notes were attached to findings that no longer appear in the current answer. 
                  They have been preserved for your reference.
                </p>
                {question.orphanedNotes.map(([findingText, note], idx) => (
                  <div key={idx} className="p-3 bg-white rounded-md border border-blue-200">
                    <p className="text-sm font-medium text-secondary-900 mb-1">
                      Original finding:
                    </p>
                    <p className="text-sm text-secondary-600 italic mb-2">
                      "{findingText}"
                    </p>
                    <p className="text-sm font-medium text-secondary-900 mb-1">
                      Your note:
                    </p>
                    <p className="text-sm text-secondary-700">{note}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Findings */}
          {question.findings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Evidence & Findings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {question.findings.map((finding, index) => (
              <FindingSection 
                key={finding.id} 
                finding={finding} 
                index={index + 1}
              />
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
        </TabsContent>

        <TabsContent value="papers">
          <PapersContributionView
            questionId={question.id}
          />
        </TabsContent>

        <TabsContent value="timeline">
          <VersionTimeline questionId={question.id} />
        </TabsContent>
      </Tabs>
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
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [localNotes, setLocalNotes] = useState(finding.userNotes || '');
  const [showCitations, setShowCitations] = useState(false);
  const [selectedMechanism, setSelectedMechanism] = useState<MechanismExplainer | null>(null);
  const [isGeneratingExplainer, setIsGeneratingExplainer] = useState(false);

  // Fetch supporting papers for citations
  const supportingPapers = useLiveQuery(
    async () => {
      if (finding.supportingPapers.length === 0) return [];
      return await db.papers.bulkGet(finding.supportingPapers);
    },
    [finding.supportingPapers]
  );

  // Detect mechanisms in the finding description
  const detectedMechanisms = detectMechanismsInText(finding.description);

  const consistencyColors = {
    high: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-red-100 text-red-800',
  };

  const handleSaveNotes = async (notes: string) => {
    await updateFindingNotes(finding.id, notes);
    setLocalNotes(notes);
  };

  const handleDeleteNotes = async () => {
    await updateFindingNotes(finding.id, '');
    setLocalNotes('');
    setIsEditingNotes(false);
  };

  const handleMechanismClick = async (mechanism: string) => {
    try {
      setIsGeneratingExplainer(true);

      // Check if explainer already exists
      let explainer = await getExplainerByMechanism(mechanism);

      if (!explainer) {
        // Generate new explainer
        const papers = await db.papers.bulkGet(finding.supportingPapers);
        const validPapers = papers.filter((p) => p !== undefined);

        explainer = await generateExplainer(mechanism, validPapers);
        await createExplainer(explainer);
      }

      setSelectedMechanism(explainer);
    } catch (error) {
      console.error('Failed to load mechanism explainer:', error);
    } finally {
      setIsGeneratingExplainer(false);
    }
  };

  return (
    <div className="border-l-4 border-primary-500 pl-4">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-secondary-900 mb-2">
            Finding {index}: {finding.description}
          </h3>
          {/* Mechanism badges */}
          {detectedMechanisms.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {detectedMechanisms.map((mechanism) => (
                <MechanismBadge
                  key={mechanism}
                  mechanism={mechanism}
                  onClick={() => handleMechanismClick(mechanism)}
                  hasExplainer={!isGeneratingExplainer}
                />
              ))}
            </div>
          )}
        </div>
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

      {/* Supporting papers with evidence */}
      {finding.supportingPapers.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowCitations(!showCitations)}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            <BookOpen className="w-4 h-4" />
            {showCitations ? 'Hide' : 'Show'} evidence ({finding.supportingPapers.length}{' '}
            {finding.supportingPapers.length === 1 ? 'paper' : 'papers'})
          </button>
          
          {showCitations && (
            <div className="mt-3 space-y-3">
              {/* Show detailed evidence if available (new format) */}
              {finding.evidence && finding.evidence.length > 0 ? (
                finding.evidence.map((evidenceSource, idx) => (
                  <div key={idx} className="bg-secondary-50 border border-secondary-200 rounded-lg p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-secondary-900">
                          {evidenceSource.paperTitle}
                        </h4>
                        <div className="flex gap-2 mt-1 text-xs text-secondary-600">
                          <span className="capitalize">{evidenceSource.studyType}</span>
                          {evidenceSource.sampleSize && <span>• n={evidenceSource.sampleSize}</span>}
                          <span>• Confidence: {(evidenceSource.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                    <blockquote className="text-sm text-secondary-700 italic border-l-2 border-primary-300 pl-3 mt-2">
                      "{evidenceSource.excerpt}"
                    </blockquote>
                  </div>
                ))
              ) : (
                /* Fallback to legacy citation format */
                supportingPapers && supportingPapers.map((paper) =>
                  paper ? (
                    <Citation 
                      key={paper.id} 
                      paper={paper}
                      compact={true}
                    />
                  ) : null
                )
              )}
            </div>
          )}
        </div>
      )}

      {/* User notes section */}
      <div className="mt-4">
        {isEditingNotes ? (
              <NotesEditor
                initialNotes={localNotes}
                onSave={handleSaveNotes}
                onCancel={() => setIsEditingNotes(false)}
                lastUpdated={finding.notesLastUpdated}
              />
        ) : localNotes ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Your Notes</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setIsEditingNotes(true)}
                  className="p-1 text-blue-600 hover:text-blue-800 rounded"
                  title="Edit notes"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDeleteNotes}
                  className="p-1 text-red-600 hover:text-red-800 rounded"
                  title="Delete notes"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-blue-800 whitespace-pre-wrap">{localNotes}</p>
            {finding.notesLastUpdated && (
              <p className="text-xs text-blue-600 mt-2">
                Last updated {new Date(finding.notesLastUpdated).toLocaleDateString()}
              </p>
            )}
          </div>
        ) : (
          <button
            onClick={() => setIsEditingNotes(true)}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            <FileText className="w-4 h-4" />
            Add personal note
          </button>
        )}
      </div>

      {/* Mechanism Explainer Modal */}
      {selectedMechanism && (
        <MechanismExplainerModal
          explainer={selectedMechanism}
          onClose={() => setSelectedMechanism(null)}
        />
      )}
    </div>
  );
};

