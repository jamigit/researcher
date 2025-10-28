/**
 * PDFUpload Component
 * Drag-and-drop PDF upload with automatic metadata extraction
 * @ai-context PDF upload component for paper ingestion
 */

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { usePaperOperations } from '@/hooks/usePapers';
import { processPDFUpload } from '@/lib/pdfExtractor';
import type { ResearchPaper } from '@/types/paper';
import { Upload, File, X, CheckCircle2, AlertCircle } from 'lucide-react';

export const PDFUpload: React.FC = () => {
  const navigate = useNavigate();
  const { addPaper } = usePaperOperations();

  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedPaper, setExtractedPaper] = useState<Partial<ResearchPaper> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelection(droppedFile);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelection(selectedFile);
    }
  };

  const handleFileSelection = async (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setExtractedPaper(null);
    setIsProcessing(true);

    try {
      const paper = await processPDFUpload(selectedFile);
      
      if (paper) {
        setExtractedPaper(paper);
      } else {
        setError('Could not extract metadata from PDF. Please add manually.');
      }
    } catch (err) {
      console.error('PDF processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!extractedPaper) return;

    setIsProcessing(true);
    try {
      const paperData = {
        ...extractedPaper,
        id: crypto.randomUUID(),
        dateAdded: new Date().toISOString(),
        dateModified: new Date().toISOString(),
      } as ResearchPaper;

      const newPaper = await addPaper(paperData);
      navigate(`/papers/${newPaper.id}`);
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save paper. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setExtractedPaper(null);
    setError(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload PDF</CardTitle>
        <p className="text-sm text-secondary-600 mt-1">
          Upload a PDF and we'll attempt to extract the paper details
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!file ? (
          <>
            {/* Drag and drop area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-secondary-300 bg-secondary-50 hover:border-secondary-400'
              }`}
            >
              <Upload
                className={`w-12 h-12 mx-auto mb-4 ${
                  isDragging ? 'text-primary-600' : 'text-secondary-400'
                }`}
              />
              <p className="text-secondary-700 font-medium mb-2">
                Drag and drop a PDF file here
              </p>
              <p className="text-sm text-secondary-500 mb-4">or</p>
              <label>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileInput}
                  className="hidden"
                />
                <Button type="button" variant="secondary" onClick={() => {}}>
                  Browse Files
                </Button>
              </label>
            </div>

            {/* Note about PDF extraction */}
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> PDF metadata extraction is experimental. You may
                need to manually edit extracted information.
              </p>
            </div>
          </>
        ) : (
          <>
            {/* File info */}
            <div className="flex items-start gap-3 p-3 bg-secondary-50 border border-secondary-200 rounded-md">
              <File className="w-5 h-5 text-secondary-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-secondary-900">{file.name}</p>
                <p className="text-sm text-secondary-600">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={handleReset}
                className="p-1 hover:bg-secondary-200 rounded transition-colors"
                aria-label="Remove file"
              >
                <X className="w-4 h-4 text-secondary-600" />
              </button>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Extracted paper */}
            {extractedPaper && (
              <div className="p-4 bg-green-50 border border-green-300 rounded-md space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-900 mb-3">
                      Metadata Extracted ✓
                    </h3>
                    <div className="space-y-3 text-sm">
                      {/* Title */}
                      <div>
                        <span className="font-medium text-green-900">Title:</span>
                        <p className="text-green-800 mt-1">
                          {extractedPaper.title}
                        </p>
                      </div>
                      
                      {/* Authors */}
                      {extractedPaper.authors && extractedPaper.authors.length > 0 && (
                        <div>
                          <span className="font-medium text-green-900">Authors:</span>
                          <p className="text-green-800 mt-1">
                            {extractedPaper.authors.map((a) => a.name).join(', ')}
                          </p>
                        </div>
                      )}
                      
                      {/* Abstract preview */}
                      {extractedPaper.abstract && (
                        <div>
                          <span className="font-medium text-green-900">Abstract:</span>
                          <p className="text-green-800 mt-1 line-clamp-3">
                            {extractedPaper.abstract}
                          </p>
                        </div>
                      )}
                      
                      {/* DOI */}
                      {extractedPaper.doi && (
                        <div>
                          <span className="font-medium text-green-900">DOI:</span>
                          <p className="text-green-800 mt-1 font-mono text-xs">
                            {extractedPaper.doi}
                          </p>
                        </div>
                      )}
                      
                      {/* Study Type */}
                      {extractedPaper.studyType && (
                        <div>
                          <span className="font-medium text-green-900">Study Type:</span>
                          <p className="text-green-800 mt-1">
                            {extractedPaper.studyType}
                          </p>
                        </div>
                      )}
                      
                      {/* Categories */}
                      {extractedPaper.categories && extractedPaper.categories.length > 0 && (
                        <div>
                          <span className="font-medium text-green-900">Categories:</span>
                          <p className="text-green-800 mt-1">
                            {extractedPaper.categories.join(', ')}
                          </p>
                        </div>
                      )}
                      
                      <p className="text-green-700 text-xs pt-2 border-t border-green-200">
                        ⚠️ Please review and edit the extracted information before saving.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              {extractedPaper ? (
                <>
                  <Button onClick={handleSave} disabled={isProcessing}>
                    Save Paper
                  </Button>
                  <Button variant="secondary" onClick={handleReset}>
                    Upload Another
                  </Button>
                </>
              ) : (
                <Button variant="secondary" onClick={handleReset}>
                  Choose Different File
                </Button>
              )}
            </div>

            {/* Processing indicator */}
            {isProcessing && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  {extractedPaper ? 'Saving paper...' : 'Processing PDF...'}
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

