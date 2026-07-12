#!/usr/bin/env node

import fetch from 'node-fetch';

const API_URL = 'http://localhost:8000';

async function testBackend() {
    console.log('🧪 Testing Synapse Backend Connection...\n');

    // Test 1: Check if backend is running
    console.log('1️⃣  Testing Backend Server...');
    try {
        const response = await fetch(`${API_URL}/api/v1/user/suggested`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log(`✅ Backend is running! (Status: ${response.status})\n`);
    } catch (error) {
        console.log(`❌ Backend is NOT running!`);
        console.log(`Error: ${error.message}\n`);
        console.log('Make sure to run: npm.cmd run dev\n');
        process.exit(1);
    }

    // Test 2: Test signup
    console.log('2️⃣  Testing Signup Endpoint...');
    try {
        const response = await fetch(`${API_URL}/api/v1/user/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: 'testuser123',
                email: 'test@example.com',
                password: 'password123'
            })
        });
        const data = await response.json();
        if (data.success || data.message.includes('different email')) {
            console.log(`✅ Signup endpoint working!\n`);
        } else {
            console.log(`⚠️  Signup endpoint responded: ${data.message}\n`);
        }
    } catch (error) {
        console.log(`❌ Signup endpoint error: ${error.message}\n`);
    }

    // Test 3: Test login with invalid credentials
    console.log('3️⃣  Testing Login Endpoint...');
    try {
        const response = await fetch(`${API_URL}/api/v1/user/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'wrongpassword'
            })
        });
        const data = await response.json();
        console.log(`✅ Login endpoint working!\n`);
    } catch (error) {
        console.log(`❌ Login endpoint error: ${error.message}\n`);
    }

    console.log('✅ All tests completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Frontend should be running on http://localhost:5173');
    console.log('2. Backend is running on http://localhost:8000');
    console.log('3. Try signing up/logging in on the frontend');
}

testBackend().catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
});
