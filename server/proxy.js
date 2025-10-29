/**
 * Development proxy server for Claude API
 * Handles CORS and keeps API key server-side
 */

import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001;

// Enable CORS for local development
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.VITE_ANTHROPIC_API_KEY,
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Proxy endpoint for Claude API
app.post('/api/claude', async (req, res) => {
  try {
    const { messages, system, model = 'claude-3-5-haiku-20241022', max_tokens = 4096 } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    console.log(`[${new Date().toISOString()}] Claude API request - Model: ${model}, Messages: ${messages.length}`);

    const response = await anthropic.messages.create({
      model,
      max_tokens,
      messages,
      system,
    });

    console.log(`[${new Date().toISOString()}] Claude API response - Usage:`, response.usage);

    res.json(response);
  } catch (error) {
    console.error('Claude API Error:', error);
    
    if (error.status) {
      return res.status(error.status).json({
        error: error.message,
        type: error.type,
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║  🚀 Claude API Proxy Server Running                  ║
╠═══════════════════════════════════════════════════════╣
║  URL:     http://localhost:${PORT}                      ║
║  Endpoint: POST /api/claude                          ║
║  Health:   GET /health                               ║
║                                                       ║
║  CORS enabled for:                                   ║
║    - http://localhost:5173                           ║
║    - http://localhost:5174                           ║
╚═══════════════════════════════════════════════════════╝
  `);

  if (!process.env.VITE_ANTHROPIC_API_KEY) {
    console.warn('⚠️  WARNING: VITE_ANTHROPIC_API_KEY not found in environment');
    console.warn('   Please add it to your .env file');
  }
});

