/**
 * Settings page
 * @ai-context Application settings and preferences
 */

import React, { useState } from 'react';
import { Download, Upload, Trash2, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { exportDatabase, importDatabase, clearAllData } from '@/services/db';
import { APP_INFO } from '@/utils/constants';

export const Settings: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isReReviewing, setIsReReviewing] = useState(false);
  const [reReviewMsg, setReReviewMsg] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await exportDatabase();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mecfs-research-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await importDatabase(data);
      alert('Data imported successfully!');
      window.location.reload(); // Refresh to show imported data
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import data. Please check the file format.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllData();
      setShowClearConfirm(false);
      alert('All data cleared successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Clear failed:', error);
      alert('Failed to clear data. Please try again.');
    }
  };

  const handleReReview = async () => {
    if (!confirm('Re-review all papers? This will parse sections and generate tags where missing.')) return;
    setIsReReviewing(true);
    setReReviewMsg(null);
    try {
      const { reReviewAllPapers } = await import('@/services/triage');
      const { processed } = await reReviewAllPapers({ analyzeFullText: true, generateTags: true });
      setReReviewMsg(`Re-reviewed ${processed} paper(s).`);
    } catch (e) {
      console.error(e);
      alert('Re-review failed. Check console for details.');
    } finally {
      setIsReReviewing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Settings</h1>
        <p className="text-secondary-600 mt-1">Manage your application preferences and data</p>
      </div>

      {/* App Information */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Application Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-secondary-600">Name:</span>
              <span className="font-medium text-secondary-900">{APP_INFO.NAME}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-600">Version:</span>
              <span className="font-medium text-secondary-900">{APP_INFO.VERSION}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary-600">Description:</span>
              <span className="font-medium text-secondary-900">{APP_INFO.DESCRIPTION}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Re-review existing papers */}
            <div className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg">
              <div>
                <h3 className="font-medium text-secondary-900">Re-review Existing Papers</h3>
                <p className="text-sm text-secondary-600">Parse full-text sections and generate tags in bulk</p>
                {reReviewMsg && (
                  <p className="text-xs text-secondary-700 mt-1">{reReviewMsg}</p>
                )}
              </div>
              <Button onClick={handleReReview} isLoading={isReReviewing} variant="secondary">
                <RefreshCcw className="h-5 w-5 mr-2" />
                Re-review
              </Button>
            </div>
            {/* Export */}
            <div className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg">
              <div>
                <h3 className="font-medium text-secondary-900">Export Data</h3>
                <p className="text-sm text-secondary-600">Download all your data as JSON</p>
              </div>
              <Button onClick={handleExport} isLoading={isExporting} variant="secondary">
                <Download className="h-5 w-5 mr-2" />
                Export
              </Button>
            </div>

            {/* Import */}
            <div className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg">
              <div>
                <h3 className="font-medium text-secondary-900">Import Data</h3>
                <p className="text-sm text-secondary-600">Restore data from a backup file</p>
              </div>
              <label htmlFor="import-file" className="cursor-pointer">
                <span className="inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 px-4 py-2 text-base bg-secondary-200 text-secondary-900 hover:bg-secondary-300 focus:ring-secondary-500 disabled:bg-secondary-100">
                  <Upload className="h-5 w-5 mr-2" />
                  {isImporting ? 'Importing...' : 'Import'}
                </span>
                <input
                  id="import-file"
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                  disabled={isImporting}
                />
              </label>
            </div>

            {/* Clear All Data */}
            <div className="p-4 border border-danger-200 rounded-lg bg-danger-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-danger-900">Clear All Data</h3>
                  <p className="text-sm text-danger-700">
                    Permanently delete all papers and notes
                  </p>
                </div>
                {!showClearConfirm ? (
                  <Button variant="danger" onClick={() => setShowClearConfirm(true)}>
                    <Trash2 className="h-5 w-5 mr-2" />
                    Clear All
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="danger" onClick={handleClearAll}>
                      Confirm
                    </Button>
                    <Button variant="secondary" onClick={() => setShowClearConfirm(false)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PWA Information */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Progressive Web App</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-secondary-700 mb-4">
            This app can be installed on your device for offline access and a native app
            experience.
          </p>
          <p className="text-sm text-secondary-600">
            Look for the install prompt in your browser's address bar or menu.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

