/**
 * Test fixtures for PubMed API responses
 * @ai-context Mock data for testing PubMed monitor
 */

export const mockPubMedSearchResponse = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE eSearchResult PUBLIC "-//NLM//DTD esearch 20060628//EN" "https://eutils.ncbi.nlm.nih.gov/eutils/dtd/20060628/esearch.dtd">
<eSearchResult>
  <Count>3</Count>
  <RetMax>3</RetMax>
  <RetStart>0</RetStart>
  <IdList>
    <Id>38234567</Id>
    <Id>38234568</Id>
    <Id>38234569</Id>
  </IdList>
</eSearchResult>`;

export const mockPubMedFetchResponse = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE PubmedArticleSet PUBLIC "-//NLM//DTD PubMedArticle, 1st January 2024//EN" "https://dtd.nlm.nih.gov/ncbi/pubmed/out/pubmed_240101.dtd">
<PubmedArticleSet>
  <PubmedArticle>
    <MedlineCitation Status="MEDLINE" Owner="NLM">
      <PMID Version="1">38234567</PMID>
      <Article PubModel="Print">
        <Journal>
          <Title>Journal of Translational Medicine</Title>
        </Journal>
        <ArticleTitle>Immune abnormalities in ME/CFS patients: A comprehensive study</ArticleTitle>
        <Abstract>
          <AbstractText>This study examined immune markers in 65 ME/CFS patients compared to healthy controls. We found significant reductions in NK cell activity and elevated inflammatory cytokines.</AbstractText>
        </Abstract>
        <AuthorList>
          <Author>
            <LastName>Smith</LastName>
            <ForeName>John</ForeName>
            <Initials>J</Initials>
            <AffiliationInfo>
              <Affiliation>Stanford University</Affiliation>
            </AffiliationInfo>
          </Author>
          <Author>
            <LastName>Doe</LastName>
            <ForeName>Jane</ForeName>
            <Initials>J</Initials>
          </Author>
        </AuthorList>
      </Article>
      <PubDate>
        <Year>2024</Year>
        <Month>01</Month>
        <Day>15</Day>
      </PubDate>
    </MedlineCitation>
    <PubmedData>
      <ArticleIdList>
        <ArticleId IdType="pubmed">38234567</ArticleId>
        <ArticleId IdType="doi">10.1186/s12967-024-00001-1</ArticleId>
      </ArticleIdList>
    </PubmedData>
  </PubmedArticle>
</PubmedArticleSet>`;

export const mockPaperCandidate = {
  pubmedId: '38234567',
  doi: '10.1186/s12967-024-00001-1',
  title: 'Immune abnormalities in ME/CFS patients: A comprehensive study',
  abstract:
    'This study examined immune markers in 65 ME/CFS patients compared to healthy controls. We found significant reductions in NK cell activity and elevated inflammatory cytokines.',
  authors: [
    { name: 'John Smith', affiliation: 'Stanford University' },
    { name: 'Jane Doe' },
  ],
  publicationDate: '2024-01-15',
  keywords: ['ME/CFS', 'immune dysfunction', 'NK cells'],
  source: 'pubmed' as const,
  sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/38234567/',
};

export const mockIrrelevantPaper = {
  pubmedId: '38234999',
  doi: '10.1234/diabetes.2024.001',
  title: 'Diabetes treatment outcomes with insulin therapy',
  abstract:
    'This randomized controlled trial evaluated insulin therapy outcomes in 120 type 2 diabetes patients over 12 months.',
  authors: [{ name: 'Bob Johnson' }],
  publicationDate: '2024-01-10',
  keywords: ['diabetes', 'insulin', 'treatment'],
  source: 'pubmed' as const,
  sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/38234999/',
};

export const mockAbstractReviewResult = {
  relevant: true,
  relevanceScore: 0.85,
  reasoning:
    'Paper directly addresses ME/CFS immune dysfunction with original research. Sample size adequate (n=65). Peer-reviewed journal.',
  suggestedCategories: ['immunology', 'biomarkers', 'pathophysiology'],
  keepForFullReview: true,
  confidence: 0.9,
};

export const mockFullTextReviewResult = {
  methodology: {
    studyDesign: 'Case-control study',
    sampleSize: 65,
    duration: '6 months',
    limitations: [
      'Single center study',
      'Predominantly female cohort',
      'No long-term follow-up',
    ],
  },
  keyFindings: [
    'NK cell activity reduced 30% in ME/CFS patients (p<0.001)',
    'IL-6 and IL-8 elevated in 70% of patients',
    'Correlation between NK cell function and fatigue severity (r=-0.65)',
  ],
  dataQuality: 0.8,
  citableResults: [
    '"NK cell cytotoxicity was significantly reduced in ME/CFS patients compared to controls (mean 15.2% vs 21.8%, p<0.001)"',
    '"Inflammatory cytokines IL-6 and IL-8 were elevated in 70% of patients"',
  ],
  contradictions: [],
  recommendAddToDatabase: true,
};

