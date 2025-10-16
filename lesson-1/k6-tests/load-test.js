import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up to 10 users
    { duration: '5m', target: 10 }, // Stay at 10 users
    { duration: '2m', target: 20 }, // Ramp up to 20 users
    { duration: '5m', target: 20 }, // Stay at 20 users
    { duration: '2m', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.1'],    // Error rate must be below 10%
    errors: ['rate<0.1'],             // Custom error rate must be below 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

// Test data
const testUsers = [
  { email: 'user1@test.com', password: 'password123' },
  { email: 'user2@test.com', password: 'password123' },
  { email: 'user3@test.com', password: 'password123' },
];

const authTokens = {};

// Setup function - runs once at the beginning
export function setup() {
  console.log('Setting up test data...');
  
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
    } else {
      console.log(`User ${user.email} might already exist`);
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

// Main test function
export default function (data) {
  const userEmail = testUsers[Math.floor(Math.random() * testUsers.length)].email;
  const token = data[userEmail];
  
  // Test scenarios
  const scenarios = [
    () => testHealthCheck(),
    () => testGetUsers(token),
    () => testGetTweets(token),
    () => testCreateTweet(token),
    () => testGetProfile(token),
  ];
  
  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  scenario();
  
  sleep(1);
}

// Test functions
function testHealthCheck() {
  const response = http.get(`${BASE_URL}/health`);
  
  check(response, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  errorRate.add(response.status !== 200);
}

function testGetUsers(token) {
  const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
  const response = http.get(`${BASE_URL}/users`, { headers });
  
  check(response, {
    'get users status is 200': (r) => r.status === 200,
    'get users response time < 500ms': (r) => r.timings.duration < 500,
    'get users returns array': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body);
      } catch {
        return false;
      }
    },
  });
  
  errorRate.add(response.status !== 200);
}

function testGetTweets(token) {
  const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
  const response = http.get(`${BASE_URL}/tweet`, { headers });
  
  check(response, {
    'get tweets status is 200': (r) => r.status === 200,
    'get tweets response time < 500ms': (r) => r.timings.duration < 500,
    'get tweets returns array': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body);
      } catch {
        return false;
      }
    },
  });
  
  errorRate.add(response.status !== 200);
}

function testCreateTweet(token) {
  if (!token) return;
  
  const tweetPayload = JSON.stringify({
    content: `Load test tweet ${Date.now()} - User: ${Math.random().toString(36).substr(2, 9)}`,
  });
  
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  
  const response = http.post(`${BASE_URL}/tweet`, tweetPayload, { headers });
  
  check(response, {
    'create tweet status is 201': (r) => r.status === 201,
    'create tweet response time < 1000ms': (r) => r.timings.duration < 1000,
    'create tweet returns tweet object': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.id && body.content;
      } catch {
        return false;
      }
    },
  });
  
  errorRate.add(response.status !== 201);
}

function testGetProfile(token) {
  if (!token) return;
  
  const headers = { 'Authorization': `Bearer ${token}` };
  const response = http.get(`${BASE_URL}/profile`, { headers });
  
  check(response, {
    'get profile status is 200': (r) => r.status === 200,
    'get profile response time < 500ms': (r) => r.timings.duration < 500,
    'get profile returns user object': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.id && body.email;
      } catch {
        return false;
      }
    },
  });
  
  errorRate.add(response.status !== 200);
}

// Teardown function - runs once at the end
export function teardown(data) {
  console.log('Load test completed');
  console.log(`Tested with ${Object.keys(data).length} authenticated users`);
}
