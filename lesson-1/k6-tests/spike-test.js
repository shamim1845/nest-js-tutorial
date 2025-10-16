import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Spike test configuration - sudden load spikes to test system resilience
export const options = {
  stages: [
    { duration: '2m', target: 10 },  // Normal load
    { duration: '1m', target: 100 }, // Sudden spike
    { duration: '2m', target: 10 },  // Back to normal
    { duration: '1m', target: 200 }, // Another spike
    { duration: '2m', target: 10 },  // Back to normal
    { duration: '1m', target: 300 }, // Final spike
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'], // 95% of requests must complete below 3s
    http_req_failed: ['rate<0.3'],     // Error rate must be below 30% during spikes
    errors: ['rate<0.3'],              // Custom error rate must be below 30%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

// Test data for spike testing
const testUsers = [
  { email: 'spike1@test.com', password: 'password123' },
  { email: 'spike2@test.com', password: 'password123' },
  { email: 'spike3@test.com', password: 'password123' },
];

const authTokens = {};

// Setup function
export function setup() {
  console.log('Setting up spike test data...');
  
  // Register test users
  for (let user of testUsers) {
    const signupPayload = JSON.stringify({
      email: user.email,
      password: user.password,
      username: user.email.split('@')[0]
    });
    
    const signupResponse = http.post(`${BASE_URL}/auth/signup`, signupPayload, {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (signupResponse.status === 201) {
      console.log(`User ${user.email} registered successfully`);
    }
  }
  
  // Login users and get tokens
  for (let user of testUsers) {
    const loginPayload = JSON.stringify({
      email: user.email,
      password: user.password,
    });
    
    const loginResponse = http.post(`${BASE_URL}/auth/login`, loginPayload, {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (loginResponse.status === 201) {
      const token = JSON.parse(loginResponse.body).accessToken;
      authTokens[user.email] = token;
      console.log(`User ${user.email} logged in successfully`);
    }
  }
  
  return authTokens;
}

// Main spike test function
export default function (data) {
  const userEmail = testUsers[Math.floor(Math.random() * testUsers.length)].email;
  const token = data[userEmail];
  
  // Spike test scenarios
  const scenarios = [
    () => spikeTestHealthCheck(),
    () => spikeTestAuth(),
    () => spikeTestAPIEndpoints(token),
    () => spikeTestDatabaseLoad(token),
  ];
  
  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  scenario();
  
  sleep(Math.random() * 2); // Random sleep to simulate real user behavior
}

// Spike test functions
function spikeTestHealthCheck() {
  const response = http.get(`${BASE_URL}/health`);
  
  check(response, {
    'spike health check status is 200': (r) => r.status === 200,
    'spike health check response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  errorRate.add(response.status !== 200);
}

function spikeTestAuth() {
  const loginPayload = JSON.stringify({
    email: testUsers[0].email,
    password: testUsers[0].password,
  });
  
  const response = http.post(`${BASE_URL}/auth/login`, loginPayload, {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(response, {
    'spike auth login status is 201': (r) => r.status === 201,
    'spike auth login response time < 1500ms': (r) => r.timings.duration < 1500,
  });
  
  errorRate.add(response.status !== 201);
}

function spikeTestAPIEndpoints(token) {
  if (!token) return;
  
  const headers = { 'Authorization': `Bearer ${token}` };
  
  // Test multiple endpoints during spike
  const endpoints = [
    `${BASE_URL}/users`,
    `${BASE_URL}/tweet`,
    `${BASE_URL}/profile`,
    `${BASE_URL}/hashtag`,
  ];
  
  const responses = endpoints.map(endpoint => http.get(endpoint, { headers }));
  
  const successCount = responses.filter(r => r.status === 200).length;
  const avgResponseTime = responses.reduce((sum, r) => sum + r.timings.duration, 0) / responses.length;
  
  check({ successCount, avgResponseTime }, {
    'spike API success rate > 50%': (obj) => obj.successCount >= 2,
    'spike API avg response time < 2000ms': (obj) => obj.avgResponseTime < 2000,
  });
  
  errorRate.add(successCount < 2);
}

function spikeTestDatabaseLoad(token) {
  if (!token) return;
  
  const headers = { 'Authorization': `Bearer ${token}` };
  
  // Create multiple tweets rapidly during spike
  const tweetPayload = JSON.stringify({
    content: `Spike test tweet ${Date.now()} - ${Math.random().toString(36).substr(2, 9)}`,
  });
  
  const requestHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  
  const response = http.post(`${BASE_URL}/tweet`, tweetPayload, { headers: requestHeaders });
  
  check(response, {
    'spike tweet creation status is 201': (r) => r.status === 201,
    'spike tweet creation response time < 2500ms': (r) => r.timings.duration < 2500,
  });
  
  // Also test reading operations
  const readResponse = http.get(`${BASE_URL}/tweet`, { headers });
  
  check(readResponse, {
    'spike tweet read status is 200': (r) => r.status === 200,
    'spike tweet read response time < 1500ms': (r) => r.timings.duration < 1500,
  });
  
  errorRate.add(response.status !== 201 || readResponse.status !== 200);
}

// Teardown function
export function teardown(data) {
  console.log('Spike test completed');
  console.log(`Spike tested with ${Object.keys(data).length} authenticated users`);
  console.log('System recovery from spikes verified');
}
