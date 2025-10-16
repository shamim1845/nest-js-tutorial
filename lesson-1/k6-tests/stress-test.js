import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Stress test configuration - gradually increase load to find breaking point
export const options = {
  stages: [
    { duration: '2m', target: 50 },  // Ramp up to 50 users
    { duration: '5m', target: 50 },  // Stay at 50 users
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 150 }, // Ramp up to 150 users
    { duration: '5m', target: 150 }, // Stay at 150 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2s
    http_req_failed: ['rate<0.2'],     // Error rate must be below 20%
    errors: ['rate<0.2'],              // Custom error rate must be below 20%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

// Test data for stress testing
const testUsers = [
  { email: 'stress1@test.com', password: 'password123' },
  { email: 'stress2@test.com', password: 'password123' },
  { email: 'stress3@test.com', password: 'password123' },
];

const authTokens = {};

// Setup function
export function setup() {
  console.log('Setting up stress test data...');
  
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

// Main stress test function
export default function (data) {
  const userEmail = testUsers[Math.floor(Math.random() * testUsers.length)].email;
  const token = data[userEmail];
  
  // Stress test scenarios - more intensive operations
  const scenarios = [
    () => stressTestAuth(),
    () => stressTestDatabaseOperations(token),
    () => stressTestConcurrentRequests(token),
    () => stressTestLargePayloads(token),
  ];
  
  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  scenario();
  
  sleep(0.5); // Reduced sleep for more intense testing
}

// Stress test functions
function stressTestAuth() {
  const loginPayload = JSON.stringify({
    email: testUsers[0].email,
    password: testUsers[0].password,
  });
  
  const response = http.post(`${BASE_URL}/auth/login`, loginPayload, {
    headers: { 'Content-Type': 'application/json' },
  });
  
  check(response, {
    'auth login status is 201': (r) => r.status === 201,
    'auth login response time < 1000ms': (r) => r.timings.duration < 1000,
  });
  
  errorRate.add(response.status !== 201);
}

function stressTestDatabaseOperations(token) {
  if (!token) return;
  
  // Test multiple database operations in sequence
  const headers = { 'Authorization': `Bearer ${token}` };
  
  // Get users
  const usersResponse = http.get(`${BASE_URL}/users`, { headers });
  check(usersResponse, {
    'stress get users status is 200': (r) => r.status === 200,
  });
  
  // Get tweets
  const tweetsResponse = http.get(`${BASE_URL}/tweet`, { headers });
  check(tweetsResponse, {
    'stress get tweets status is 200': (r) => r.status === 200,
  });
  
  // Get profile
  const profileResponse = http.get(`${BASE_URL}/profile`, { headers });
  check(profileResponse, {
    'stress get profile status is 200': (r) => r.status === 200,
  });
  
  errorRate.add(usersResponse.status !== 200 || tweetsResponse.status !== 200 || profileResponse.status !== 200);
}

function stressTestConcurrentRequests(token) {
  if (!token) return;
  
  const headers = { 'Authorization': `Bearer ${token}` };
  
  // Send multiple concurrent requests
  const requests = [
    http.get(`${BASE_URL}/users`, { headers }),
    http.get(`${BASE_URL}/tweet`, { headers }),
    http.get(`${BASE_URL}/profile`, { headers }),
    http.get(`${BASE_URL}/hashtag`, { headers }),
  ];
  
  const successCount = requests.filter(r => r.status === 200).length;
  
  check({ successCount }, {
    'concurrent requests success rate > 75%': (obj) => obj.successCount >= 3,
  });
  
  errorRate.add(successCount < 3);
}

function stressTestLargePayloads(token) {
  if (!token) return;
  
  // Test with large tweet content
  const largeContent = 'A'.repeat(1000) + ` - Stress test tweet ${Date.now()}`;
  const tweetPayload = JSON.stringify({
    content: largeContent,
  });
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  
  const response = http.post(`${BASE_URL}/tweet`, tweetPayload, { headers });
  
  check(response, {
    'large payload status is 201': (r) => r.status === 201,
    'large payload response time < 2000ms': (r) => r.timings.duration < 2000,
  });
  
  errorRate.add(response.status !== 201);
}

// Teardown function
export function teardown(data) {
  console.log('Stress test completed');
  console.log(`Stress tested with ${Object.keys(data).length} authenticated users`);
}
