/**
 * MechanismBadge Component
 * Small badge/chip that shows mechanism name and opens explainer modal
 */

import React from 'react';
import { Lightbulb } from 'lucide-react';

export interface MechanismBadgeProps {
  mechanism: string;
  onClick: () => void;
  hasExplainer?: boolean;
}

export const MechanismBadge: React.FC<MechanismBadgeProps> = ({
  mechanism,
  onClick,
  hasExplainer = true,
}) => {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full hover:bg-purple-200 transition-colors"
      title={hasExplainer ? 'Click to learn more' : 'Generating explainer...'}
    >
      <Lightbulb className="w-3 h-3" />
      <span>{mechanism}</span>
    </button>
  );
};

