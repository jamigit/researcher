/**
 * Form for manually adding research papers
 * @ai-context Complete form with validation for paper entry
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { usePaperOperations } from '@/hooks/usePapers';
import { validateManualEntry, parseAuthors, parseTags } from '@/utils/validation';
import { CATEGORIES, STUDY_TYPES } from '@/utils/constants';
import type { ResearchPaper } from '@/types/paper';
import { ReadStatus, Importance, Category } from '@/types/paper';
import { ZodError } from 'zod';

export const AddPaperForm: React.FC = () => {
  const navigate = useNavigate();
  const { addPaper } = usePaperOperations();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    abstract: '',
    publicationDate: '',
    journal: '',
    url: '',
    doi: '',
    studyType: '',
    categories: [] as Category[],
    tags: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCategoryChange = (category: Category) => {
    setFormData((prev) => {
      const categories = prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category];
      return { ...prev, categories };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      // Validate form data
      const validatedData = validateManualEntry(formData);

      // Parse authors and tags
      const authors = parseAuthors(validatedData.authors);
      const tags = parseTags(validatedData.tags || '');

      // Create paper object
      const paperData: Omit<ResearchPaper, 'id' | 'dateAdded' | 'dateModified'> = {
        title: validatedData.title,
        authors,
        abstract: validatedData.abstract,
        publicationDate: new Date(validatedData.publicationDate).toISOString(),
        journal: validatedData.journal,
        url: validatedData.url,
        doi: validatedData.doi,
        studyType: validatedData.studyType,
        categories: validatedData.categories,
        tags,
        readStatus: ReadStatus.UNREAD,
        importance: Importance.MEDIUM,
        fullTextAvailable: false,
      };

      // Save to database
      const newPaper = await addPaper(paperData);

      // Navigate to the new paper
      navigate(`/papers/${newPaper.id}`);
    } catch (error) {
      if (error instanceof ZodError) {
        // Handle validation errors
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as string;
          fieldErrors[field] = err.message;
        });
        setErrors(fieldErrors);
      } else {
        console.error('Failed to add paper:', error);
        setErrors({ submit: 'Failed to add paper. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card padding="lg">
      <CardHeader>
        <CardTitle>Add Research Paper Manually</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error message */}
          {errors.submit && (
            <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">
              {errors.submit}
            </div>
          )}

          {/* Title */}
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            required
            fullWidth
            placeholder="Enter the paper title"
          />

          {/* Authors */}
          <Input
            label="Authors"
            name="authors"
            value={formData.authors}
            onChange={handleChange}
            error={errors.authors}
            helperText="Comma-separated list of author names"
            required
            fullWidth
            placeholder="John Doe, Jane Smith"
          />

          {/* Abstract */}
          <div className="w-full">
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Abstract <span className="text-danger-500 ml-1">*</span>
            </label>
            <textarea
              name="abstract"
              value={formData.abstract}
              onChange={handleChange}
              rows={6}
              required
              className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                errors.abstract
                  ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500'
                  : 'border-secondary-300 focus:border-primary-500 focus:ring-primary-500'
              }`}
              placeholder="Enter the paper abstract"
            />
            {errors.abstract && <p className="mt-1 text-sm text-danger-600">{errors.abstract}</p>}
          </div>

          {/* Publication Date */}
          <Input
            label="Publication Date"
            name="publicationDate"
            type="date"
            value={formData.publicationDate}
            onChange={handleChange}
            error={errors.publicationDate}
            required
            fullWidth
          />

          {/* Journal */}
          <Input
            label="Journal"
            name="journal"
            value={formData.journal}
            onChange={handleChange}
            error={errors.journal}
            fullWidth
            placeholder="Journal name (optional)"
          />

          {/* URL */}
          <Input
            label="URL"
            name="url"
            type="url"
            value={formData.url}
            onChange={handleChange}
            error={errors.url}
            fullWidth
            placeholder="https://example.com/paper"
          />

          {/* DOI */}
          <Input
            label="DOI"
            name="doi"
            value={formData.doi}
            onChange={handleChange}
            error={errors.doi}
            fullWidth
            placeholder="10.1234/example"
          />

          {/* Study Type */}
          <div className="w-full">
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Study Type
            </label>
            <select
              name="studyType"
              value={formData.studyType}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-secondary-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-500 transition-colors"
            >
              <option value="">Select study type (optional)</option>
              {STUDY_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Categories */}
          <div className="w-full">
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => handleCategoryChange(category.value)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    formData.categories.includes(category.value)
                      ? 'bg-primary-600 text-white'
                      : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <Input
            label="Tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            error={errors.tags}
            helperText="Comma-separated tags for easy searching"
            fullWidth
            placeholder="ME/CFS, fatigue, treatment"
          />

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
              Add Paper
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/papers')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

