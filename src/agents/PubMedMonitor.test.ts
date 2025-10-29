/**
 * Unit tests for PubMed Monitor
 * @ai-context Tests PubMed API interaction and XML parsing
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  buildPubMedQuery,
  parsePubMedXML,
  getDateRangeLastDays,
  searchPubMed,
} from './PubMedMonitor';
import { mockPubMedFetchResponse } from '@/test/fixtures/pubmedResponses';

describe('PubMedMonitor', () => {
  describe('buildPubMedQuery', () => {
    it('should build query with keywords and date range', () => {
      const query = buildPubMedQuery(
        ['ME/CFS', 'chronic fatigue syndrome'],
        { from: '2024-01-01', to: '2024-01-07' }
      );
      
      expect(query).toContain('"ME/CFS"[Title/Abstract]');
      expect(query).toContain('"chronic fatigue syndrome"[Title/Abstract]');
      expect(query).toContain('2024-01-01');
      expect(query).toContain('2024-01-07');
      expect(query).toContain('OR');
      expect(query).toContain('AND');
    });
    
    it('should handle single keyword', () => {
      const query = buildPubMedQuery(
        ['ME/CFS'],
        { from: '2024-01-01', to: '2024-01-07' }
      );
      
      expect(query).toContain('"ME/CFS"[Title/Abstract]');
      expect(query).not.toContain('OR');
    });
  });
  
  describe('parsePubMedXML', () => {
    it('should extract paper metadata from XML', () => {
      const papers = parsePubMedXML(mockPubMedFetchResponse);
      
      expect(papers).toHaveLength(1);
      expect(papers[0]).toMatchObject({
        pubmedId: '38234567',
        doi: '10.1186/s12967-024-00001-1',
        title: expect.stringContaining('Immune abnormalities'),
        abstract: expect.stringContaining('immune markers'),
        authors: expect.arrayContaining([
          expect.objectContaining({ name: expect.stringContaining('Smith') }),
        ]),
        source: 'pubmed',
      });
    });
    
    it('should handle multiple articles', () => {
      const multiXml = mockPubMedFetchResponse.replace(
        '</PubmedArticleSet>',
        mockPubMedFetchResponse.match(/<PubmedArticle>.*?<\/PubmedArticle>/s)?.[0] +
          '</PubmedArticleSet>'
      );
      
      const papers = parsePubMedXML(multiXml);
      expect(papers.length).toBeGreaterThanOrEqual(1);
    });
    
    it('should handle empty XML', () => {
      const papers = parsePubMedXML('<?xml version="1.0"?><PubmedArticleSet></PubmedArticleSet>');
      expect(papers).toHaveLength(0);
    });
    
    it('should skip articles missing required fields', () => {
      const incompleteXml = `<?xml version="1.0"?>
        <PubmedArticleSet>
          <PubmedArticle>
            <MedlineCitation>
              <PMID>12345</PMID>
              <Article>
                <ArticleTitle>Title Only</ArticleTitle>
              </Article>
            </MedlineCitation>
          </PubmedArticle>
        </PubmedArticleSet>`;
      
      const papers = parsePubMedXML(incompleteXml);
      expect(papers).toHaveLength(0); // Missing abstract
    });
  });
  
  describe('getDateRangeLastDays', () => {
    it('should return date range for last 7 days', () => {
      const range = getDateRangeLastDays(7);
      
      expect(range.from).toMatch(/\d{4}-\d{2}-\d{2}/);
      expect(range.to).toMatch(/\d{4}-\d{2}-\d{2}/);
      
      const fromDate = new Date(range.from);
      const toDate = new Date(range.to);
      const diffDays = Math.floor((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
      
      expect(diffDays).toBe(7);
    });
    
    it('should return today as end date', () => {
      const range = getDateRangeLastDays(1);
      const today = new Date().toISOString().split('T')[0];
      
      expect(range.to).toBe(today);
    });
  });
  
  describe('searchPubMed', () => {
    beforeEach(() => {
      global.fetch = vi.fn();
    });
    
    it('should call PubMed API with correct parameters', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          esearchresult: {
            idlist: ['38234567', '38234568'],
          },
        }),
      });
      
      const pmids = await searchPubMed({
        keywords: ['ME/CFS'],
        dateRange: { from: '2024-01-01', to: '2024-01-07' },
        maxResults: 10,
      });
      
      expect(global.fetch).toHaveBeenCalled();
      const callUrl = (global.fetch as any).mock.calls[0][0];
      expect(callUrl).toContain('esearch.fcgi');
      // ME/CFS is URL-encoded in the query
      expect(callUrl).toMatch(/%22ME%2FCFS%22/);
      expect(callUrl).toContain('retmax=10');
      
      expect(pmids).toEqual(['38234567', '38234568']);
    });
    
    it('should handle API errors', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });
      
      await expect(
        searchPubMed({
          keywords: ['ME/CFS'],
          dateRange: { from: '2024-01-01', to: '2024-01-07' },
          maxResults: 10,
        })
      ).rejects.toThrow('Failed to search PubMed');
    });
    
    it('should respect maxResults limit', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          esearchresult: {
            idlist: ['1', '2', '3', '4', '5'],
          },
        }),
      });
      
      const pmids = await searchPubMed({
        keywords: ['ME/CFS'],
        dateRange: { from: '2024-01-01', to: '2024-01-07' },
        maxResults: 3,
      });
      
      const callUrl = (global.fetch as any).mock.calls[0][0];
      expect(callUrl).toContain('retmax=3');
    });
  });
});

