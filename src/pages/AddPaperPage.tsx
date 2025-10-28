/**
 * AddPaperPage Component
 * Entry point for adding papers - routes to smart or manual entry
 * @ai-context Main add paper page with toggle between smart and manual
 */

import React, { useState } from 'react';
import { SmartAddPaper } from '@/components/papers/SmartAddPaper';
import { AddPaperForm } from '@/components/papers/AddPaperForm';
import { PDFUpload } from '@/components/papers/PDFUpload';
import { Sparkles, Edit3, FileUp } from 'lucide-react';

export const AddPaperPage: React.FC = () => {
  const [mode, setMode] = useState<'smart' | 'manual' | 'pdf'>('smart');

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex gap-2 p-1 bg-secondary-100 rounded-lg w-fit">
        <button
          onClick={() => setMode('smart')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'smart'
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-secondary-600 hover:text-secondary-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Smart Fetch
        </button>
        <button
          onClick={() => setMode('pdf')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'pdf'
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-secondary-600 hover:text-secondary-900'
          }`}
        >
          <FileUp className="w-4 h-4" />
          Upload PDF
        </button>
        <button
          onClick={() => setMode('manual')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'manual'
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-secondary-600 hover:text-secondary-900'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          Manual Entry
        </button>
      </div>

      {/* Content */}
      {mode === 'smart' && <SmartAddPaper />}
      {mode === 'pdf' && <PDFUpload />}
      {mode === 'manual' && <AddPaperForm />}
    </div>
  );
};

