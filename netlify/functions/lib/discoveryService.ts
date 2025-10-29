import { getDateRangeLastDays, discoverNewPapers } from '../../../src/agents/PubMedMonitor';
import { batchScreenAbstracts, getDefaultCriteria } from '../../../src/workflows/abstractScreening';

export interface DiscoveryServiceOptions {
  keywords?: string[];
  dateRange?: 'last-7-days' | 'last-14-days' | { from: string; to: string };
  notify?: boolean;
}

export async function discoverAndAnalyzePapers(options: DiscoveryServiceOptions = {}) {
  const keywords = options.keywords ?? ['ME/CFS', 'chronic fatigue syndrome', 'myalgic encephalomyelitis'];
  const dateRange =
    options.dateRange === 'last-14-days'
      ? getDateRangeLastDays(14)
      : options.dateRange === 'last-7-days' || !options.dateRange
      ? getDateRangeLastDays(7)
      : options.dateRange;

  // 1) Discover papers from PubMed
  const discovered = await discoverNewPapers({
    keywords,
    dateRange,
    maxResults: 100,
    // Pick up optional env for rate limits if present
    email: process.env.NCBI_EMAIL,
    apiKey: process.env.NCBI_API_KEY,
  });

  // 2) Screen abstracts
  const screened = await batchScreenAbstracts(discovered, getDefaultCriteria());
  const approved = screened.filter((r) => r.result.keepForFullReview);

  // 3) Build response summary (no DB writes in function MVP)
  const topPapers = approved.slice(0, 5).map(({ paper, result }) => ({
    title: paper.title,
    pubmedId: paper.pubmedId,
    url: paper.sourceUrl,
    relevanceScore: result.relevanceScore,
  }));

  return {
    papersFound: discovered.length,
    papersScreened: screened.length,
    papersApproved: approved.length,
    topPapers,
    startedAt: new Date().toISOString(),
    durationSeconds: 0, // caller can compute
  };
}
