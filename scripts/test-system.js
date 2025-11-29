// Automated system testing script
// Run with: node scripts/test-system.js

const https = require('https');
const http = require('http');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const tests = [];
let passed = 0;
let failed = 0;

function addTest(name, fn) {
  tests.push({ name, fn });
}

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    reset: '\x1b[0m',
  };
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  console.log(`${colors[type]}${icon} ${message}${colors.reset}`);
}

// Test Supabase connection
addTest('Supabase Connection', async () => {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Supabase credentials not configured');
  }
  
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/`);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    };

    const req = https.request(options, (res) => {
      if (res.statusCode === 200 || res.statusCode === 404) {
        resolve();
      } else {
        reject(new Error(`Status: ${res.statusCode}`));
      }
    });

    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
});

// Test database tables
addTest('Database Tables', async () => {
  const tables = ['assessments', 'gigs', 'helpers'];
  
  for (const table of tables) {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${table}?select=*&limit=1`);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
    };

    await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        if (res.statusCode === 200 || res.statusCode === 401) {
          resolve();
        } else {
          reject(new Error(`Table ${table}: Status ${res.statusCode}`));
        }
      });

      req.on('error', reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error(`Table ${table}: Timeout`));
      });

      req.end();
    });
  }
});

// Run all tests
async function runTests() {
  log('Starting system tests...\n', 'info');

  for (const test of tests) {
    try {
      await test.fn();
      log(`${test.name}: PASSED`, 'success');
      passed++;
    } catch (error) {
      log(`${test.name}: FAILED - ${error.message}`, 'error');
      failed++;
    }
  }

  console.log('\n' + '='.repeat(50));
  log(`Tests completed: ${passed} passed, ${failed} failed`, failed > 0 ? 'error' : 'success');
  console.log('='.repeat(50) + '\n');

  process.exit(failed > 0 ? 1 : 0);
}

runTests();

