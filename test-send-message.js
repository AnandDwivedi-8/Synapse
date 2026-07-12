import axios from 'axios';
import { config } from 'dotenv';

config();

const API = axios.create({
    baseURL: 'http://localhost:4000/api/v1',
    withCredentials: true
});

// Test sending a message
async function testSendMessage() {
    try {
        // Use test user IDs from your database
        const senderId = '693457c8f12f74edc3a72c28'; // root
        const receiverId = '69346171a3a7e51ececfbc86'; // sarah_pink
        
        // First, try to get auth from cookies by making a request to get conversations
        // This will simulate being logged in
        
        console.log('Testing message send...');
        console.log('Sending message from', senderId, 'to', receiverId);
        
        const res = await API.post(`/message/send/${receiverId}`, 
            { textMessage: 'Test message from script' },
            {
                headers: {
                    'Cookie': `token=your_token_here` // You'll need to add the actual token
                }
            }
        );
        
        console.log('Response:', res.data);
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

testSendMessage();
