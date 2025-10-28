/**
 * SmartAddPaper Component
 * Intelligent paper addition with automatic metadata fetching
 * @ai-context Smart ingestion workflow - paste URL/DOI/PMID and auto-fetch
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { usePaperOperations } from '@/hooks/usePapers';
import { fetchPaper, identifyInputType, validateFetchedPaper } from '@/tools/PaperFetcher';
import { InputType } from '@/types/fetcher';
import type { ResearchPaper } from '@/types/paper';
import { Loader2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

export const SmartAddPaper: React.FC = () => {
  const navigate = useNavigate();
  const { addPaper } = usePaperOperations();

  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [fetchedPaper, setFetchedPaper] = useState<Partial<ResearchPaper> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputType, setInputType] = useState<InputType | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    setError(null);
    setFetchedPaper(null);

    // Identify input type as user types
    if (value.trim()) {
      const type = identifyInputType(value.trim());
      setInputType(type);
    } else {
      setInputType(null);
    }
  };

  const handleFetch = async () => {
    if (!input.trim()) {
      setError('Please enter a DOI, PMID, or PubMed URL');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setFetchedPaper(null);

    try {
      const result = await fetchPaper(input.trim());

      if (result.success && result.paper) {
        // Validate the fetched paper
        if (validateFetchedPaper(result.paper)) {
          setFetchedPaper(result.paper);
        } else {
          setError('Fetched paper is incomplete. Please add manually or try a different source.');
        }
      } else {
        setError(result.error || 'Failed to fetch paper. Please try manual entry.');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('An unexpected error occurred. Please try again or use manual entry.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!fetchedPaper) return;

    setIsProcessing(true);
    try {
      const paperData = {
        ...fetchedPaper,
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
    setInput('');
    setFetchedPaper(null);
    setError(null);
    setInputType(null);
  };

  const handleManualEntry = () => {
    navigate('/papers/add-manual');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Paper - Smart Fetch</CardTitle>
          <p className="text-sm text-secondary-600 mt-1">
            Paste a DOI, PMID, or paper URL (PubMed, Springer, Nature, etc.) and we'll automatically fetch the details
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input field */}
          <div>
            <label
              htmlFor="paper-input"
              className="block text-sm font-medium text-secondary-700 mb-2"
            >
              Paper Identifier
            </label>
            <textarea
              id="paper-input"
              value={input}
              onChange={handleInputChange}
              placeholder="Paste DOI, PMID, PubMed/Springer/Nature URL..."
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-y min-h-[80px]"
              disabled={isProcessing || !!fetchedPaper}
            />

            {/* Input type indicator */}
            {inputType && !fetchedPaper && (
              <div className="mt-2 flex items-center gap-2 text-sm">
                <span className="text-secondary-600">Detected:</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-medium">
                  {inputType.toUpperCase().replace('_', ' ')}
                </span>
              </div>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Fetched paper preview */}
          {fetchedPaper && (
            <div className="p-4 bg-green-50 border-2 border-green-300 rounded-md space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 mb-2">
                    Paper Found!
                  </h3>

                  <div className="space-y-2 text-sm">
                    {/* Title */}
                    <div>
                      <span className="font-medium text-green-900">Title:</span>
                      <p className="text-green-800 mt-1">{fetchedPaper.title}</p>
                    </div>

                    {/* Authors */}
                    {fetchedPaper.authors && fetchedPaper.authors.length > 0 && (
                      <div>
                        <span className="font-medium text-green-900">Authors:</span>
                        <p className="text-green-800 mt-1">
                          {fetchedPaper.authors
                            .map((a) => a.name)
                            .slice(0, 3)
                            .join(', ')}
                          {fetchedPaper.authors.length > 3 && ' et al.'}
                        </p>
                      </div>
                    )}

                    {/* Journal & Date */}
                    <div className="flex flex-wrap gap-3 text-green-700">
                      {fetchedPaper.journal && (
                        <span>📖 {fetchedPaper.journal}</span>
                      )}
                      {fetchedPaper.publicationDate && (
                        <span>
                          📅{' '}
                          {new Date(fetchedPaper.publicationDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* DOI/PMID */}
                    <div className="flex flex-wrap gap-3 text-green-700 text-xs">
                      {fetchedPaper.doi && <span>DOI: {fetchedPaper.doi}</span>}
                      {fetchedPaper.pubmedId && (
                        <span>PMID: {fetchedPaper.pubmedId}</span>
                      )}
                    </div>

                    {/* Abstract preview */}
                    {fetchedPaper.abstract && (
                      <div>
                        <span className="font-medium text-green-900">
                          Abstract:
                        </span>
                        <p className="text-green-800 mt-1 line-clamp-3">
                          {fetchedPaper.abstract}
                        </p>
                      </div>
                    )}

                    {/* URL */}
                    {fetchedPaper.url && (
                      <a
                        href={fetchedPaper.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-green-700 hover:text-green-900 underline"
                      >
                        View source
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            {!fetchedPaper ? (
              <>
                <Button
                  onClick={handleFetch}
                  disabled={!input.trim() || isProcessing}
                  isLoading={isProcessing}
                  className="gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Fetching...
                    </>
                  ) : (
                    'Fetch Paper'
                  )}
                </Button>
                <Button variant="secondary" onClick={handleManualEntry}>
                  Manual Entry Instead
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleSave}
                  disabled={isProcessing}
                  isLoading={isProcessing}
                >
                  Save Paper
                </Button>
                <Button variant="secondary" onClick={handleReset}>
                  Fetch Another
                </Button>
              </>
            )}
          </div>

          {/* Processing indicator */}
          {isProcessing && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <p className="text-sm text-blue-800">
                  {fetchedPaper
                    ? 'Saving paper...'
                    : 'Fetching paper metadata... This may take a few seconds.'}
                </p>
              </div>
            </div>
          )}

          {/* Help text */}
          <div className="pt-4 border-t border-secondary-200">
            <h4 className="text-sm font-medium text-secondary-900 mb-2">
              Supported Formats:
            </h4>
            <ul className="text-sm text-secondary-600 space-y-1">
              <li>• <strong>DOI:</strong> 10.1234/example</li>
              <li>
                • <strong>PMID:</strong> 12345678 (PubMed ID)
              </li>
              <li>
                • <strong>PubMed URL:</strong> https://pubmed.ncbi.nlm.nih.gov/12345678/
              </li>
              <li>
                • <strong>Springer URL:</strong> https://link.springer.com/article/10.1007/...
              </li>
              <li>
                • <strong>Nature URL:</strong> https://www.nature.com/articles/s41467-...
              </li>
              <li className="text-xs mt-2 text-secondary-500">
                + Any publisher URL containing a DOI
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

