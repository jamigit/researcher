/**
 * QuestionsPage Component
 * Main page for Q&A system - view and manage research questions
 * @ai-context Q&A dashboard with question list and add functionality
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { QuestionList } from '@/components/questions/QuestionList';
import { AddQuestionForm } from '@/components/questions/AddQuestionForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Plus, HelpCircle, AlertTriangle } from 'lucide-react';
import { db } from '@/services/db';
import type { ResearchQuestion } from '@/types/question';

export const QuestionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Load all questions from database
  const questions = useLiveQuery(() => db.questions.toArray(), []) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Research Questions</h1>
          <p className="text-secondary-600 mt-1">
            Ask questions and get evidence-based answers from your research papers
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-5 h-5 mr-2" />
          {showAddForm ? 'Cancel' : 'Ask Question'}
        </Button>
      </div>

      {/* Info Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-blue-900 mb-1">How Q&A Works</h3>
              <p className="text-sm text-blue-800 mb-2">
                Ask a research question, and we'll analyze your papers to find evidence-based answers.
                We use conservative language and highlight contradictions prominently.
              </p>
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <AlertTriangle className="w-4 h-4" />
                <span>Contradictions are shown in yellow warning boxes - they're impossible to miss!</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Question Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Ask a New Question</CardTitle>
          </CardHeader>
          <CardContent>
            <AddQuestionForm
              onQuestionAdded={() => {
                setShowAddForm(false);
              }}
              onCancel={() => setShowAddForm(false)}
            />
          </CardContent>
        </Card>
      )}

      {/* Question List */}
      <QuestionList
        questions={questions}
        onQuestionClick={(question: ResearchQuestion) => navigate(`/questions/${question.id}`)}
        onAddQuestion={() => setShowAddForm(true)}
      />
    </div>
  );
};

