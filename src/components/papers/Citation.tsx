/**
 * Citation Component
 * Displays a formatted citation with copy functionality
 */

import React, { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { formatCitation, formatCitationPlainText, type CitationStyle } from '@/utils/citations';
import type { ResearchPaper } from '@/types/paper';

export interface CitationProps {
  paper: ResearchPaper;
  format?: CitationStyle;
  copyable?: boolean;
  showLink?: boolean;
  compact?: boolean;
}

export const Citation: React.FC<CitationProps> = ({
  paper,
  format = 'apa',
  copyable = true,
  showLink = true,
  compact = false,
}) => {
  const [copied, setCopied] = useState(false);

  const citation = formatCitation(paper, format);
  const plainCitation = formatCitationPlainText(paper, format);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(plainCitation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy citation:', error);
    }
  };

  const getLink = (): string | null => {
    if (paper.doi) {
      return `https://doi.org/${paper.doi}`;
    }
    if (paper.pubmedId) {
      return `https://pubmed.ncbi.nlm.nih.gov/${paper.pubmedId}/`;
    }
    return null;
  };

  const link = showLink ? getLink() : null;

  // Render markdown-style italics as actual italics
  const renderCitation = (text: string) => {
    const parts = text.split(/(\*[^*]+\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={index}>{part.slice(1, -1)}</em>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 text-sm">
        <span className="text-secondary-700">{renderCitation(citation)}</span>
        {copyable && (
          <button
            onClick={handleCopy}
            className="p-1 text-secondary-500 hover:text-secondary-700 rounded"
            title="Copy citation"
          >
            {copied ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>
        )}
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 text-primary-600 hover:text-primary-700 rounded"
            title="View paper"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-3">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="text-sm text-secondary-700">{renderCitation(citation)}</p>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          {copyable && (
            <button
              onClick={handleCopy}
              className="p-2 text-secondary-600 hover:text-secondary-800 hover:bg-secondary-100 rounded transition-colors"
              title="Copy citation"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          )}
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors"
              title="View paper online"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
      {copied && (
        <p className="text-xs text-green-600 mt-1">Citation copied to clipboard!</p>
      )}
    </div>
  );
};

