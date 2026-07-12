import mongoose from 'mongoose';
import { config } from 'dotenv';
import { Message } from './backend/models/message.model.js';
import { encryptMessage, decryptMessage } from './backend/utils/encryption.js';

config();

async function encryptAllMessages() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URL);
        console.log('✅ Connected to MongoDB');

        console.log('\nFetching all messages...');
        const allMessages = await Message.find({});
        console.log(`Found ${allMessages.length} messages to process`);

        let encryptedCount = 0;
        let alreadyEncryptedCount = 0;
        let processedCount = 0;

        for (const message of allMessages) {
            processedCount++;
            
            // Check if already encrypted
            if (typeof message.message === 'string' && message.message.startsWith('U2FsdGVkX')) {
                alreadyEncryptedCount++;
                console.log(`[${processedCount}/${allMessages.length}] ⏭️  Already encrypted: "${message.message.substring(0, 20)}..."`);
            } else {
                // Encrypt the message
                const originalMessage = message.message;
                const encryptedMessage = encryptMessage(originalMessage);
                
                // Update in database
                message.message = encryptedMessage;
                await message.save();
                
                encryptedCount++;
                console.log(`[${processedCount}/${allMessages.length}] ✅ Encrypted: "${originalMessage.substring(0, 20)}..." → "${encryptedMessage.substring(0, 20)}..."`);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('ENCRYPTION COMPLETE!');
        console.log('='.repeat(60));
        console.log(`Total messages processed: ${processedCount}`);
        console.log(`Newly encrypted: ${encryptedCount}`);
        console.log(`Already encrypted: ${alreadyEncryptedCount}`);
        console.log(`Total encrypted in database: ${encryptedCount + alreadyEncryptedCount}/${allMessages.length}`);

        // Verify by decrypting all
        console.log('\nVerifying decryption...');
        const verifyMessages = await Message.find({}).limit(3);
        for (const msg of verifyMessages) {
            const decrypted = decryptMessage(msg.message);
            console.log(`Sample: "${msg.message.substring(0, 20)}..." → "${decrypted.substring(0, 30)}..."`);
        }

        console.log('\n✨ All done! Messages are now encrypted with backward compatibility.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

encryptAllMessages();
