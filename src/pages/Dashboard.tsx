/**
 * Dashboard page - main landing page
 * @ai-context Overview page with stats and recent papers
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Book, TrendingUp } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { PaperList } from '@/components/papers/PaperList';
import { usePapers, useUnreadCount, useRecentPapers } from '@/hooks/usePapers';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { papers } = usePapers();
  const unreadCount = useUnreadCount();
  const { papers: recentPapers, isLoading: isLoadingRecent } = useRecentPapers(5);

  const stats = [
    {
      label: 'Total Papers',
      value: papers.length,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Unread Papers',
      value: unreadCount,
      icon: Book,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      label: 'This Week',
      value: 0, // @ai-technical-debt(medium, low, low) Calculate papers added this week
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Dashboard</h1>
          <p className="text-secondary-600 mt-1">Track and manage your ME/CFS research papers</p>
        </div>
        <Button onClick={() => navigate('/papers/add')}>
          <Plus className="h-5 w-5 mr-2" />
          Add Paper
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} padding="md">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-secondary-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Papers */}
      <Card padding="lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Papers</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/papers')}>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <PaperList
            papers={recentPapers}
            isLoading={isLoadingRecent}
            emptyMessage="No papers yet. Click 'Add Paper' to get started!"
          />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/papers/add')}
              className="flex items-center gap-4 p-4 border-2 border-dashed border-secondary-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left"
            >
              <div className="bg-primary-100 p-3 rounded-lg">
                <Plus className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-medium text-secondary-900">Add Paper Manually</h3>
                <p className="text-sm text-secondary-600">Enter paper details manually</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/search')}
              className="flex items-center gap-4 p-4 border-2 border-dashed border-secondary-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left"
            >
              <div className="bg-primary-100 p-3 rounded-lg">
                <FileText className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-medium text-secondary-900">Search Papers</h3>
                <p className="text-sm text-secondary-600">Find papers in your collection</p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

