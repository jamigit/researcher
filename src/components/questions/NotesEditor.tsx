/**
 * NotesEditor Component
 * Allows users to add personal notes to findings with auto-save
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/common/Button';
import { Save, X } from 'lucide-react';

export interface NotesEditorProps {
  initialNotes?: string;
  onSave: (notes: string) => Promise<void>;
  onCancel: () => void;
  lastUpdated?: string;
}

const MAX_CHARS = 500;
const AUTO_SAVE_DELAY = 3000; // 3 seconds

export const NotesEditor: React.FC<NotesEditorProps> = ({
  initialNotes = '',
  onSave,
  onCancel,
  lastUpdated,
}) => {
  const [notes, setNotes] = useState(initialNotes);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await onSave(notes);
      setLastSaved(new Date().toISOString());
    } catch (error) {
      console.error('Failed to save notes:', error);
    } finally {
      setIsSaving(false);
    }
  }, [notes, onSave]);

  // Auto-save logic
  useEffect(() => {
    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Don't auto-save if notes haven't changed
    if (notes === initialNotes) {
      return;
    }

    // Set new timer for auto-save
    autoSaveTimerRef.current = setTimeout(() => {
      handleSave();
    }, AUTO_SAVE_DELAY);

    // Cleanup on unmount
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [notes, initialNotes, handleSave]);

  const handleManualSave = async () => {
    await handleSave();
    onCancel(); // Close editor after manual save
  };

  const handleCancel = () => {
    // Clear auto-save timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    onCancel();
  };

  const remainingChars = MAX_CHARS - notes.length;
  const isOverLimit = remainingChars < 0;

  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-blue-900">Personal Notes</h4>
        {isSaving && (
          <span className="text-sm text-blue-600">Saving...</span>
        )}
        {lastSaved && !isSaving && (
          <span className="text-sm text-blue-600">
            Saved {new Date(lastSaved).toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add your personal notes about this finding..."
        className={`w-full px-3 py-2 border rounded-md resize-y min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          isOverLimit ? 'border-red-300 bg-red-50' : 'border-blue-300 bg-white'
        }`}
        maxLength={MAX_CHARS + 50} // Allow typing a bit over for UX
      />

      {/* Character count */}
      <div className="flex items-center justify-between text-sm">
        <span
          className={
            isOverLimit
              ? 'text-red-600 font-medium'
              : remainingChars < 50
                ? 'text-yellow-600'
                : 'text-blue-600'
          }
        >
          {remainingChars} characters remaining
        </span>
        {lastUpdated && (
          <span className="text-blue-600">
            Last updated {new Date(lastUpdated).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleManualSave}
          disabled={isSaving || isOverLimit}
          size="sm"
        >
          <Save className="w-4 h-4 mr-1" />
          Save & Close
        </Button>
        <Button onClick={handleCancel} variant="outline" size="sm">
          <X className="w-4 h-4 mr-1" />
          Cancel
        </Button>
      </div>

      {/* Help text */}
      <p className="text-xs text-blue-700">
        💡 Notes auto-save after 3 seconds of inactivity. These are private and
        stored locally on your device.
      </p>
    </div>
  );
};

