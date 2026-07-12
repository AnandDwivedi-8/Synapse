#!/usr/bin/env node

/**
 * Backend Health Check & Diagnostic Tool
 * Tests MongoDB connection, server status, and key endpoints
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import http from 'http';

dotenv.config();

const API_URL = 'http://localhost:8000';
const MONGO_URI = process.env.MONGO_URI;

console.log('\n🔍 Synapse Backend Diagnostic Tool\n');
console.log('='.repeat(50));

// Test 1: MongoDB Connection
async function testMongoDBConnection() {
    console.log('\n1️⃣  Testing MongoDB Connection...');
    try {
        await mongoose.connect(MONGO_URI, {
            maxPoolSize: 1,
            serverSelectionTimeoutMS: 3000,
        });
        console.log('✅ MongoDB Connection: SUCCESS');
        console.log(`   URI: ${MONGO_URI.replace(/:[^:]*@/, ':***@')}`);
        
        // Check collections
        const db = mongoose.connection;
        const collections = await db.db.listCollections().toArray();
        console.log(`   Collections found: ${collections.length}`);
        collections.forEach(col => console.log(`     - ${col.name}`));
        
        await mongoose.disconnect();
        return true;
    } catch (error) {
        console.log('❌ MongoDB Connection: FAILED');
        console.log(`   Error: ${error.message}`);
        console.log('\n   💡 Troubleshooting:');
        console.log('     - Is MongoDB running? (Check: netstat -ano | findstr :27017)');
        console.log('     - Is MONGO_URI correct in .env?');
        console.log('     - Is MongoDB accepting connections?');
        return false;
    }
}

// Test 2: Backend Server
function testBackendServer() {
    console.log('\n2️⃣  Testing Backend Server...');
    
    return new Promise((resolve) => {
        const req = http.get('http://localhost:8000', (res) => {
            console.log(`✅ Backend Server: RUNNING (Status: ${res.statusCode})`);
            resolve(true);
        });
        
        req.on('error', (error) => {
            console.log('❌ Backend Server: NOT RUNNING');
            console.log(`   Error: ${error.message}`);
            console.log('\n   💡 Troubleshooting:');
            console.log('     - Run: npm.cmd run dev');
            console.log('     - Check port 8000 is not in use: netstat -ano | findstr :8000');
            console.log('     - Check backend logs for startup errors');
            resolve(false);
        });
        
        req.setTimeout(3000, () => {
            req.destroy();
            console.log('❌ Backend Server: NOT RESPONDING');
            resolve(false);
        });
    });
}

// Test 3: Environment Variables
function testEnvironmentVariables() {
    console.log('\n3️⃣  Checking Environment Variables...');
    
    const required = ['MONGO_URI', 'JWT_SECRET', 'SECRET_KEY', 'PORT', 'URL'];
    const missing = [];
    
    required.forEach(key => {
        if (!process.env[key]) {
            missing.push(key);
            console.log(`   ❌ ${key}: NOT SET`);
        } else {
            if (key === 'MONGO_URI') {
                console.log(`   ✅ ${key}: ${process.env[key].replace(/:[^:]*@/, ':***@')}`);
            } else if (key.includes('SECRET') || key.includes('KEY')) {
                console.log(`   ✅ ${key}: ***`);
            } else {
                console.log(`   ✅ ${key}: ${process.env[key]}`);
            }
        }
    });
    
    return missing.length === 0;
}

// Main diagnostic runner
async function runDiagnostics() {
    try {
        const envOk = testEnvironmentVariables();
        const mongoOk = await testMongoDBConnection();
        const serverOk = await testBackendServer();
        
        console.log('\n' + '='.repeat(50));
        console.log('\n📊 DIAGNOSTIC SUMMARY\n');
        
        console.log(`Environment Variables: ${envOk ? '✅ OK' : '❌ MISSING'}`);
        console.log(`MongoDB Connection:    ${mongoOk ? '✅ OK' : '❌ FAILED'}`);
        console.log(`Backend Server:        ${serverOk ? '✅ OK' : '❌ NOT RUNNING'}`);
        
        console.log('\n' + '='.repeat(50));
        
        if (!envOk) {
            console.log('\n⚠️  ACTION REQUIRED: Check .env file for missing variables');
        }
        if (!mongoOk) {
            console.log('\n⚠️  ACTION REQUIRED: Start MongoDB or update MONGO_URI in .env');
        }
        if (!serverOk) {
            console.log('\n⚠️  ACTION REQUIRED: Start backend (npm.cmd run dev)');
        }
        if (envOk && mongoOk && serverOk) {
            console.log('\n✅ Backend appears to be working correctly!');
            console.log('\n📱 Next steps:');
            console.log('   1. Start frontend: npm.cmd run dev --prefix frontend');
            console.log('   2. Visit http://localhost:5173');
            console.log('   3. Try signup/login');
        }
        
        process.exit(envOk && mongoOk && serverOk ? 0 : 1);
    } catch (error) {
        console.error('\n💥 Diagnostic failed:', error.message);
        process.exit(1);
    }
}

// Run diagnostics
runDiagnostics();
