/**
 * Paper detail component
 * @ai-context Full paper view with all metadata and actions
 */

import React from 'react';
import { Calendar, User, ExternalLink, Tag, BookOpen } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card, CardContent, CardHeader } from '@/components/common/Card';
import type { ResearchPaper } from '@/types/paper';
import {
  formatDate,
  formatAuthors,
  enumToLabel,
  getPubMedUrl,
  getDoiUrl,
} from '@/utils/formatting';
import { READ_STATUSES, IMPORTANCE_LEVELS } from '@/utils/constants';
import { usePaperOperations } from '@/hooks/usePapers';
import { ReadStatus } from '@/types/paper';

interface PaperDetailProps {
  paper: ResearchPaper;
}

export const PaperDetail: React.FC<PaperDetailProps> = ({ paper }) => {
  const { updatePaper } = usePaperOperations();

  const readStatusConfig = READ_STATUSES.find((s) => s.value === paper.readStatus);
  const importanceConfig = IMPORTANCE_LEVELS.find((i) => i.value === paper.importance);

  const handleMarkAsRead = async () => {
    await updatePaper(paper.id, { readStatus: ReadStatus.READ });
  };

  const handleMarkAsUnread = async () => {
    await updatePaper(paper.id, { readStatus: ReadStatus.UNREAD });
  };

  return (
    <div className="space-y-6">
      {/* Status Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white ${readStatusConfig?.color}`}
          >
            {readStatusConfig?.label}
          </span>
          <span className={`text-sm font-medium ${importanceConfig?.color}`}>
            {importanceConfig?.label}
          </span>
        </div>
        <div className="flex gap-2">
          {paper.readStatus !== ReadStatus.READ && (
            <Button onClick={handleMarkAsRead} variant="secondary" size="sm">
              Mark as Read
            </Button>
          )}
          {paper.readStatus === ReadStatus.READ && (
            <Button onClick={handleMarkAsUnread} variant="secondary" size="sm">
              Mark as Unread
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Card */}
      <Card padding="lg">
        <CardHeader>
          <h1 className="text-2xl md:text-3xl font-semibold text-secondary-900">{paper.title}</h1>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <User className="h-5 w-5 text-secondary-500 mt-0.5" />
                <div>
                  <p className="font-medium text-secondary-900">Authors</p>
                  <p className="text-secondary-600">{formatAuthors(paper.authors, 10)}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="h-5 w-5 text-secondary-500 mt-0.5" />
                <div>
                  <p className="font-medium text-secondary-900">Publication Date</p>
                  <p className="text-secondary-600">{formatDate(paper.publicationDate)}</p>
                </div>
              </div>
              {paper.journal && (
                <div className="flex items-start gap-2">
                  <BookOpen className="h-5 w-5 text-secondary-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-secondary-900">Journal</p>
                    <p className="text-secondary-600">{paper.journal}</p>
                  </div>
                </div>
              )}
            </div>

            {/* External Links */}
            {(paper.url || paper.doi || paper.pubmedId) && (
              <div className="flex flex-wrap gap-2">
                {paper.url && (
                  <a
                    href={paper.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors text-sm font-medium"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Paper
                  </a>
                )}
                {paper.pubmedId && (
                  <a
                    href={getPubMedUrl(paper.pubmedId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-secondary-50 text-secondary-700 rounded-lg hover:bg-secondary-100 transition-colors text-sm font-medium"
                  >
                    PubMed
                  </a>
                )}
                {paper.doi && (
                  <a
                    href={getDoiUrl(paper.doi)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-secondary-50 text-secondary-700 rounded-lg hover:bg-secondary-100 transition-colors text-sm font-medium"
                  >
                    DOI
                  </a>
                )}
              </div>
            )}

            {/* Abstract */}
            <div>
              <h2 className="text-lg font-semibold text-secondary-900 mb-2">Abstract</h2>
              <p className="text-secondary-700 leading-relaxed whitespace-pre-line">
                {paper.abstract}
              </p>
            </div>

            {/* Categories */}
            {paper.categories.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-secondary-900 mb-2">Categories</h2>
                <div className="flex flex-wrap gap-2">
                  {paper.categories.map((category) => (
                    <span
                      key={category}
                      className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-primary-50 text-primary-700"
                    >
                      {enumToLabel(category)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {paper.tags.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-secondary-900 mb-2">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {paper.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium bg-secondary-100 text-secondary-700"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Personal Notes */}
            {paper.personalNotes && (
              <div>
                <h2 className="text-lg font-semibold text-secondary-900 mb-2">Personal Notes</h2>
                <p className="text-secondary-700 leading-relaxed whitespace-pre-line bg-secondary-50 p-4 rounded-lg">
                  {paper.personalNotes}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

