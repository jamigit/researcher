/**
 * ContradictionBox Component
 * VERY PROMINENT yellow warning box for contradictions in evidence
 * @ai-context CRITICAL: Contradictions must be unmissable per PRD requirements
 */

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/common/Card';
import type { Contradiction } from '@/types/contradiction';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

export interface ContradictionBoxProps {
  contradiction: Contradiction;
}

/**
 * ContradictionBox - Prominent yellow warning for contradictory evidence
 * Design: Large, yellow, impossible to miss
 */
export const ContradictionBox: React.FC<ContradictionBoxProps> = ({
  contradiction,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <Card className="border-4 border-yellow-500 bg-yellow-50 shadow-lg">
      <CardContent className="p-5">
        {/* Header - Always visible, very prominent */}
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="w-8 h-8 text-yellow-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-yellow-900 mb-1">
              ⚠️ CONTRADICTION DETECTED
            </h2>
            <p className="text-yellow-800 font-medium">
              Research papers disagree on: {contradiction.topic}
            </p>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-yellow-200 rounded transition-colors"
            aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
          >
            {isExpanded ? (
              <ChevronUp className="w-6 h-6 text-yellow-700" />
            ) : (
              <ChevronDown className="w-6 h-6 text-yellow-700" />
            )}
          </button>
        </div>

        {isExpanded && (
          <div className="space-y-4">
            {/* Severity badge */}
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  contradiction.severity === 'major'
                    ? 'bg-red-200 text-red-900'
                    : 'bg-yellow-200 text-yellow-900'
                }`}
              >
                {contradiction.severity === 'major' ? 'MAJOR' : 'Minor'}{' '}
                Contradiction
              </span>
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  contradiction.status === 'unresolved'
                    ? 'bg-orange-200 text-orange-900'
                    : 'bg-blue-200 text-blue-900'
                }`}
              >
                {contradiction.status}
              </span>
            </div>

            {/* Side-by-side comparison */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Majority view */}
              <div className="p-4 bg-white border-2 border-yellow-400 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold text-yellow-700">
                    {contradiction.majorityView.paperCount}
                  </span>
                  <span className="text-sm font-semibold text-yellow-800">
                    {contradiction.majorityView.paperCount === 1
                      ? 'PAPER'
                      : 'PAPERS'}
                  </span>
                </div>
                <h3 className="font-bold text-secondary-900 mb-2">
                  Majority View
                </h3>
                <p className="text-secondary-800 mb-3">
                  {contradiction.majorityView.description}
                </p>
                {contradiction.majorityView.evidence && (
                  <div className="p-2 bg-blue-50 rounded text-sm">
                    <p className="font-medium text-blue-900 mb-1">Evidence:</p>
                    <p className="text-blue-800">
                      {contradiction.majorityView.evidence}
                    </p>
                  </div>
                )}
              </div>

              {/* Minority view */}
              <div className="p-4 bg-white border-2 border-yellow-400 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold text-yellow-700">
                    {contradiction.minorityView.paperCount}
                  </span>
                  <span className="text-sm font-semibold text-yellow-800">
                    {contradiction.minorityView.paperCount === 1
                      ? 'PAPER'
                      : 'PAPERS'}
                  </span>
                </div>
                <h3 className="font-bold text-secondary-900 mb-2">
                  Minority View
                </h3>
                <p className="text-secondary-800 mb-3">
                  {contradiction.minorityView.description}
                </p>
                {contradiction.minorityView.evidence && (
                  <div className="p-2 bg-blue-50 rounded text-sm">
                    <p className="font-medium text-blue-900 mb-1">Evidence:</p>
                    <p className="text-blue-800">
                      {contradiction.minorityView.evidence}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Methodological differences */}
            {contradiction.methodologicalDifferences.length > 0 && (
              <div className="p-4 bg-white rounded-lg">
                <h3 className="font-bold text-secondary-900 mb-2">
                  Why Papers Might Disagree
                </h3>
                <ul className="space-y-1">
                  {contradiction.methodologicalDifferences.map((diff, index) => (
                    <li key={index} className="text-secondary-700 flex items-start gap-2">
                      <span className="text-yellow-600 font-bold mt-1">•</span>
                      <span>{diff}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Possible explanations */}
            {contradiction.possibleExplanations.length > 0 && (
              <div className="p-4 bg-white rounded-lg">
                <h3 className="font-bold text-secondary-900 mb-2">
                  Possible Biological Explanations
                </h3>
                <ul className="space-y-1">
                  {contradiction.possibleExplanations.map((explanation, index) => (
                    <li
                      key={index}
                      className="text-secondary-700 flex items-start gap-2"
                    >
                      <span className="text-blue-600 font-bold mt-1">→</span>
                      <span>{explanation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Conservative interpretation */}
            <div className="p-4 bg-white border-2 border-blue-400 rounded-lg">
              <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                <span className="text-lg">💡</span>
                Conservative Interpretation
              </h3>
              <p className="text-secondary-800 leading-relaxed">
                {contradiction.conservativeInterpretation}
              </p>
            </div>

            {/* User analysis section */}
            {contradiction.userAnalysis && (
              <div className="p-4 bg-purple-50 border border-purple-300 rounded-lg">
                <h3 className="font-bold text-purple-900 mb-2">Your Analysis</h3>
                <p className="text-purple-800">{contradiction.userAnalysis}</p>
              </div>
            )}

            {/* Metadata */}
            <div className="text-sm text-yellow-800">
              Detected: {new Date(contradiction.dateDetected).toLocaleDateString()}
              {' • '}
              Last updated: {new Date(contradiction.lastUpdated).toLocaleDateString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

