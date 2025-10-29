/**
 * ExportButton Component
 * Allows users to export question summaries in various formats
 */

import React, { useState } from 'react';
import { Download, FileText, Check } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { exportToMarkdown, downloadExport } from '@/services/export';
import type { ExportOptions, ExportFormat, ExportAudience } from '@/types/export';

export interface ExportButtonProps {
  questionId: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  questionId,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [exported, setExported] = useState(false);

  const handleExport = async (format: ExportFormat, audience: ExportAudience) => {
    try {
      setIsExporting(true);
      setShowMenu(false);

      const options: Partial<ExportOptions> = {
        format,
        audience,
        includeMetadata: true,
        includeCitations: true,
        includeNotes: true,
        includeContradictions: true,
        includeMechanisms: true,
      };

      if (format === ExportFormat.MARKDOWN) {
        const markdown = await exportToMarkdown(questionId, options);
        const filename = `research-summary-${Date.now()}.md`;
        downloadExport(markdown, filename, 'text/markdown');
      }
      // Future: Add PDF export using jsPDF or similar
      // Future: Add HTML export

      setExported(true);
      setTimeout(() => setExported(false), 3000);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setShowMenu(!showMenu)}
        variant="outline"
        size="sm"
        disabled={isExporting}
      >
        {exported ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Exported!
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export'}
          </>
        )}
      </Button>

      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white border border-secondary-200 rounded-lg shadow-lg z-20">
            <div className="p-3 border-b border-secondary-200">
              <h4 className="font-medium text-secondary-900 text-sm">Export Format</h4>
              <p className="text-xs text-secondary-600 mt-1">
                Choose format and audience
              </p>
            </div>

            <div className="p-2">
              {/* Markdown for Doctor */}
              <button
                onClick={() => handleExport(ExportFormat.MARKDOWN, ExportAudience.DOCTOR)}
                className="w-full text-left px-3 py-2 rounded hover:bg-secondary-50 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-secondary-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm text-secondary-900">
                      Markdown (Doctor)
                    </div>
                    <div className="text-xs text-secondary-600">
                      Medical language, citations included
                    </div>
                  </div>
                </div>
              </button>

              {/* Markdown for Patient */}
              <button
                onClick={() => handleExport(ExportFormat.MARKDOWN, ExportAudience.PATIENT)}
                className="w-full text-left px-3 py-2 rounded hover:bg-secondary-50 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-secondary-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm text-secondary-900">
                      Markdown (Plain Language)
                    </div>
                    <div className="text-xs text-secondary-600">
                      Simple explanations, patient-friendly
                    </div>
                  </div>
                </div>
              </button>

              {/* PDF - Coming Soon */}
              <button
                disabled
                className="w-full text-left px-3 py-2 rounded opacity-50 cursor-not-allowed"
              >
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-secondary-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm text-secondary-900">
                      PDF Export
                    </div>
                    <div className="text-xs text-secondary-600">Coming soon</div>
                  </div>
                </div>
              </button>
            </div>

            <div className="p-3 bg-secondary-50 border-t border-secondary-200 text-xs text-secondary-600">
              💡 Exports include citations, findings, and contradictions
            </div>
          </div>
        </>
      )}
    </div>
  );
};

