/**
 * MechanismExplainerModal Component
 * Modal displaying plain language + technical explanation of a mechanism
 */

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { X, ChevronDown, ChevronUp, BookOpen, Lightbulb, Microscope, AlertCircle } from 'lucide-react';
import { Citation } from '@/components/papers/Citation';
import { db } from '@/services/db';
import type { MechanismExplainer } from '@/types/mechanism';

export interface MechanismExplainerModalProps {
  explainer: MechanismExplainer;
  onClose: () => void;
}

export const MechanismExplainerModal: React.FC<MechanismExplainerModalProps> = ({
  explainer,
  onClose,
}) => {
  const [showTechnical, setShowTechnical] = useState(false);

  // Fetch supporting papers
  const supportingPapers = useLiveQuery(
    async () => {
      if (explainer.supportingPapers.length === 0) return [];
      return await db.papers.bulkGet(explainer.supportingPapers);
    },
    [explainer.supportingPapers]
  );

  const readabilityScore = explainer.readabilityScore;
  const isEasyToRead = readabilityScore && readabilityScore <= 10;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-secondary-200 flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb className="w-5 h-5 text-purple-600" />
              <h2 className="text-2xl font-bold text-secondary-900">
                {explainer.mechanism}
              </h2>
            </div>
            <p className="text-sm text-secondary-600">
              Biological Mechanism Explainer
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-secondary-500 hover:text-secondary-700 hover:bg-secondary-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Plain Language Section */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">
                Plain Language Explanation
              </h3>
              {isEasyToRead && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  Grade {readabilityScore} reading level
                </span>
              )}
            </div>

            <div className="space-y-4">
              {/* What is it? */}
              <div>
                <h4 className="font-medium text-blue-900 mb-1">What is it?</h4>
                <p className="text-blue-800">{explainer.plainLanguage.definition}</p>
              </div>

              {/* How does it work? */}
              <div>
                <h4 className="font-medium text-blue-900 mb-1">How does it work?</h4>
                <p className="text-blue-800">{explainer.plainLanguage.howItWorks}</p>
              </div>

              {/* Why does it matter? */}
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Why does it matter for ME/CFS?</h4>
                <p className="text-blue-800">{explainer.plainLanguage.relevance}</p>
              </div>
            </div>
          </div>

          {/* Technical Details Section (Collapsible) */}
          <div className="border border-secondary-300 rounded-lg">
            <button
              onClick={() => setShowTechnical(!showTechnical)}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-secondary-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Microscope className="w-5 h-5 text-secondary-700" />
                <h3 className="text-lg font-semibold text-secondary-900">
                  Technical Details
                </h3>
              </div>
              {showTechnical ? (
                <ChevronUp className="w-5 h-5 text-secondary-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-secondary-500" />
              )}
            </button>

            {showTechnical && (
              <div className="px-5 pb-5 space-y-4 border-t border-secondary-200 pt-4">
                {/* Biochemical Process */}
                <div>
                  <h4 className="font-medium text-secondary-900 mb-2">
                    Biochemical Process
                  </h4>
                  <p className="text-secondary-700 text-sm">
                    {explainer.technicalDetails.biochemicalProcess}
                  </p>
                </div>

                {/* Evidence */}
                {explainer.technicalDetails.evidence.length > 0 && (
                  <div>
                    <h4 className="font-medium text-secondary-900 mb-2">
                      Evidence from Research
                    </h4>
                    <ul className="space-y-2">
                      {explainer.technicalDetails.evidence.map((ev, index) => (
                        <li key={index} className="text-secondary-700 text-sm flex items-start gap-2">
                          <span className="text-primary-600 mt-1">•</span>
                          <span>{ev}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Uncertainties */}
                {explainer.technicalDetails.uncertainties.length > 0 && (
                  <div>
                    <h4 className="font-medium text-secondary-900 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      Uncertainties & Debates
                    </h4>
                    <ul className="space-y-2">
                      {explainer.technicalDetails.uncertainties.map((unc, index) => (
                        <li key={index} className="text-secondary-700 text-sm flex items-start gap-2">
                          <span className="text-yellow-600 mt-1">•</span>
                          <span>{unc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Supporting Papers */}
          {explainer.supportingPapers.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 mb-3">
                Supporting Papers ({explainer.supportingPapers.length})
              </h3>
              <div className="space-y-2">
                {supportingPapers?.map((paper) =>
                  paper ? (
                    <Citation key={paper.id} paper={paper} compact={true} />
                  ) : null
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="text-xs text-secondary-500 pt-4 border-t border-secondary-200">
            Last updated {new Date(explainer.lastUpdated).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

