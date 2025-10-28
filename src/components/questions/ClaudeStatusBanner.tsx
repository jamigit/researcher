/**
 * ClaudeStatusBanner Component
 * Shows a warning when Claude API is not configured
 */

import { AlertTriangle } from 'lucide-react';
import { Card } from '@/components/common/Card';

interface ClaudeStatusBannerProps {
  show: boolean;
}

export const ClaudeStatusBanner: React.FC<ClaudeStatusBannerProps> = ({ show }) => {
  if (!show) return null;

  return (
    <Card className="bg-yellow-50 border-yellow-200">
      <div className="flex items-start gap-3 p-4">
        <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-yellow-900 mb-1">
            Claude API Not Configured
          </h3>
          <p className="text-sm text-yellow-800 mb-2">
            AI-powered evidence extraction requires a Claude API key. Questions can still be created,
            but evidence extraction and contradiction detection will not be available.
          </p>
          <div className="text-sm text-yellow-700">
            <p className="font-medium mb-1">To enable AI features:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Get an API key from <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-900">Anthropic Console</a></li>
              <li>Add it to your <code className="px-1 py-0.5 bg-yellow-100 rounded text-xs">.env</code> file as <code className="px-1 py-0.5 bg-yellow-100 rounded text-xs">VITE_ANTHROPIC_API_KEY</code></li>
              <li>Restart the development server</li>
            </ol>
          </div>
        </div>
      </div>
    </Card>
  );
};

