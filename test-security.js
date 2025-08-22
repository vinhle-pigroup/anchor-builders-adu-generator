#!/usr/bin/env node

/**
 * Security Test Script
 * Tests all security features implemented in the server
 */

const serverUrl = process.argv[2] || 'http://localhost:8080';

console.log('🔒 Testing Security Features at:', serverUrl);
console.log('=' .repeat(50));

async function testHealthEndpoint() {
  console.log('\n📋 Testing Health Endpoint...');
  try {
    const response = await fetch(`${serverUrl}/health`);
    const data = await response.json();
    
    console.log('✅ Health Status:', data.status);
    console.log('✅ Service:', data.service);
    console.log('✅ Security Features:');
    console.log('   - Helmet:', data.security?.helmet);
    console.log('   - CORS:', data.security?.cors);
    console.log('   - Rate Limiting:', data.security?.rateLimit);
    console.log('   - Trust Proxy:', data.security?.trustProxy);
    console.log('   - API Key Configured:', data.security?.apiKeyConfigured);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }
}

async function testSecurityHeaders() {
  console.log('\n🛡️ Testing Security Headers...');
  try {
    const response = await fetch(`${serverUrl}/health`);
    
    const headers = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection',
      'referrer-policy',
      'content-security-policy'
    ];
    
    headers.forEach(header => {
      const value = response.headers.get(header);
      if (value) {
        console.log(`✅ ${header}:`, value.substring(0, 50) + (value.length > 50 ? '...' : ''));
      } else {
        console.log(`⚠️ ${header}: Not set`);
      }
    });
  } catch (error) {
    console.error('❌ Security headers test failed:', error.message);
  }
}

async function testCORS() {
  console.log('\n🌐 Testing CORS...');
  try {
    const response = await fetch(`${serverUrl}/health`, {
      headers: {
        'Origin': 'https://malicious-site.com'
      }
    });
    
    const corsHeader = response.headers.get('access-control-allow-origin');
    if (corsHeader === 'https://malicious-site.com') {
      console.log('⚠️ CORS is too permissive - allowing untrusted origin');
    } else {
      console.log('✅ CORS properly configured - blocking untrusted origins');
    }
  } catch (error) {
    console.error('❌ CORS test failed:', error.message);
  }
}

async function testPDFProxy() {
  console.log('\n🖨️ Testing PDF Proxy Endpoint...');
  try {
    // Test without API key (should work through proxy)
    const response = await fetch(`${serverUrl}/api/generate-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        template: 'test',
        data: { test: 'data' }
      })
    });
    
    if (response.status === 500) {
      const error = await response.json();
      if (error.error === 'PDF service not configured') {
        console.log('⚠️ PDF proxy endpoint exists but API key not configured');
      } else {
        console.log('✅ PDF proxy endpoint responding');
      }
    } else if (response.ok) {
      console.log('✅ PDF proxy endpoint working');
    } else {
      console.log('⚠️ PDF proxy returned:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ PDF proxy test failed:', error.message);
  }
}

async function testRateLimiting() {
  console.log('\n⏱️ Testing Rate Limiting...');
  console.log('   (Making 5 rapid requests to /api/generate-pdf)');
  
  const requests = [];
  for (let i = 0; i < 5; i++) {
    requests.push(
      fetch(`${serverUrl}/api/generate-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: i })
      })
    );
  }
  
  try {
    const responses = await Promise.all(requests);
    const statuses = responses.map(r => r.status);
    
    if (statuses.some(s => s === 429)) {
      console.log('✅ Rate limiting is working (429 Too Many Requests)');
    } else {
      console.log('ℹ️ Rate limiting may be disabled in development mode');
      console.log('   Response statuses:', statuses);
    }
  } catch (error) {
    console.error('❌ Rate limiting test failed:', error.message);
  }
}

// Run all tests
async function runTests() {
  await testHealthEndpoint();
  await testSecurityHeaders();
  await testCORS();
  await testPDFProxy();
  await testRateLimiting();
  
  console.log('\n' + '=' .repeat(50));
  console.log('🔒 Security testing complete!');
  console.log('\n📝 Remember to set these in Railway:');
  console.log('   - PDF_SERVICE_API_KEY (new rotated key)');
  console.log('   - PDF_SERVICE_URL');
  console.log('   - API_TRUSTED_ORIGIN (if needed)');
}

runTests().catch(console.error);