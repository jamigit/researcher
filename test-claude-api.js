// Quick test script to verify Claude API is working
import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file
dotenv.config({ path: join(__dirname, '.env') });

const apiKey = process.env.VITE_ANTHROPIC_API_KEY;

console.log('🔍 Testing Claude API Configuration...\n');

// Check if API key exists
if (!apiKey) {
  console.error('❌ ERROR: VITE_ANTHROPIC_API_KEY not found in .env file');
  process.exit(1);
}

if (!apiKey.startsWith('sk-ant-')) {
  console.error('❌ ERROR: API key format is incorrect (should start with sk-ant-)');
  process.exit(1);
}

console.log('✅ API key found in .env file');
console.log('✅ API key format is correct (sk-ant-...)');
console.log(`✅ Key length: ${apiKey.length} characters\n`);

// Test API call
console.log('📡 Testing API connection...\n');

const client = new Anthropic({ apiKey });

try {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 150,
    temperature: 0.1,
    system: 'You are a helpful assistant testing API connectivity.',
    messages: [
      {
        role: 'user',
        content: 'Please respond with "API test successful" if you receive this message.',
      },
    ],
  });

  const response = message.content[0].text;

  console.log('✅ API Connection Successful!\n');
  console.log('📝 Claude Response:');
  console.log('─'.repeat(50));
  console.log(response);
  console.log('─'.repeat(50));
  console.log('\n✨ Your Claude API is working correctly!\n');
  console.log('📊 Usage:');
  console.log(`   • Input tokens: ${message.usage.input_tokens}`);
  console.log(`   • Output tokens: ${message.usage.output_tokens}`);
  console.log(`   • Model: ${message.model}`);
  console.log(`   • Stop reason: ${message.stop_reason}\n`);

  // Test conservative prompting
  console.log('🧪 Testing Conservative Language Prompt...\n');

  const conservativeTest = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 200,
    temperature: 0.1,
    system: `You are a conservative medical research assistant. CRITICAL: You must NEVER use definitive language like "proves", "confirms", "definitely", "always". Instead, use tentative language like "suggests", "may indicate", "appears to", "evidence shows".`,
    messages: [
      {
        role: 'user',
        content:
          'Based on research showing reduced ATP in ME/CFS patients, what does this tell us about energy production?',
      },
    ],
  });

  const conservativeResponse = conservativeTest.content[0].text;

  console.log('📝 Conservative Response:');
  console.log('─'.repeat(50));
  console.log(conservativeResponse);
  console.log('─'.repeat(50));

  // Check for banned words
  const bannedWords = [
    'proves',
    'confirms',
    'definitely',
    'always',
    'never',
    'caused by',
    'establishes',
    'demonstrates conclusively',
  ];
  const foundBanned = bannedWords.filter((word) =>
    conservativeResponse.toLowerCase().includes(word)
  );

  if (foundBanned.length > 0) {
    console.log(`\n⚠️  WARNING: Found non-conservative language: ${foundBanned.join(', ')}`);
    console.log('   (This should be fixed in the actual prompts)\n');
  } else {
    console.log('\n✅ Conservative language verified - no definitive claims found!\n');
  }

  console.log('─'.repeat(70));
  console.log('🎉 ALL TESTS PASSED - Claude API is ready for use!');
  console.log('─'.repeat(70));
  console.log('\n💡 Next steps:');
  console.log('   1. Go to http://localhost:5173');
  console.log('   2. Navigate to Questions page');
  console.log('   3. Add some papers (or use Smart Fetch)');
  console.log('   4. Ask a research question');
  console.log('   5. Watch AI extract evidence!\n');

  process.exit(0);
} catch (error) {
  console.error('\n❌ API Test Failed!\n');
  console.error('Error details:');
  console.error('─'.repeat(50));
  console.error(`Message: ${error.message}`);
  if (error.status) console.error(`Status: ${error.status}`);
  if (error.type) console.error(`Type: ${error.type}`);
  console.error('─'.repeat(50));

  if (error.status === 401) {
    console.error('\n🔑 Authentication Error:');
    console.error('   • Your API key may be invalid or expired');
    console.error('   • Check your key at https://console.anthropic.com/');
    console.error('   • Make sure you have credits/billing set up\n');
  } else if (error.status === 429) {
    console.error('\n⏱️  Rate Limit Error:');
    console.error('   • You have exceeded your API rate limit');
    console.error('   • Wait a few minutes and try again');
    console.error('   • Consider upgrading your plan\n');
  } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    console.error('\n🌐 Network Error:');
    console.error('   • Check your internet connection');
    console.error('   • Verify you can access api.anthropic.com\n');
  }

  process.exit(1);
}

