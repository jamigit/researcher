import { schedule } from '@netlify/functions';
import { discoverAndAnalyzePapers } from './lib/discoveryService';

export const handler = schedule('0 9 * * *', async () => {
  const start = Date.now();
  try {
    const result = await discoverAndAnalyzePapers({
      keywords: ['ME/CFS', 'chronic fatigue syndrome'],
      dateRange: 'last-7-days',
      notify: true,
    });

    const response = {
      ...result,
      durationSeconds: Math.floor((Date.now() - start) / 1000),
      timestamp: new Date().toISOString(),
    };

    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      statusCode: 500,
      body: JSON.stringify({ error: message }),
    };
  }
});
