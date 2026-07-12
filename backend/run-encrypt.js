import mongoose from 'mongoose';
import { config } from 'dotenv';
import { Message } from './models/message.model.js';
import CryptoJS from 'crypto-js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, '.env') });

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'synapse_secure_message_encryption_key_12345';
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('❌ MONGO_URI not found in .env');
    process.exit(1);
}

const encryptMessage = (message) => {
    if (!message) return message;
    try {
        const encrypted = CryptoJS.AES.encrypt(message, ENCRYPTION_KEY).toString();
        return encrypted;
    } catch (error) {
        console.error('Encryption error:', error);
        return message;
    }
};

async function encryptAllMessages() {
    try {
        console.log('\nConnecting to MongoDB...');
        console.log('URI:', MONGO_URI.substring(0, 30) + '...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected!\n');

        const allMessages = await Message.find({});
        console.log(`Found ${allMessages.length} messages\n`);

        let encrypted = 0, already = 0;

        for (let i = 0; i < allMessages.length; i++) {
            const msg = allMessages[i];
            if (typeof msg.message === 'string' && msg.message.startsWith('U2FsdGVkX')) {
                already++;
            } else {
                msg.message = encryptMessage(msg.message);
                await msg.save();
                encrypted++;
                if ((i+1) % 5 === 0) console.log(`[${i+1}/${allMessages.length}] Encrypted...`);
            }
        }

        console.log(`\n✅ Done! Encrypted: ${encrypted}, Already encrypted: ${already}\n`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

encryptAllMessages();
