// Admin utility to encrypt all existing messages
// Call this once from backend console or via API endpoint

import { Message } from "../models/message.model.js";
import { encryptMessage, decryptMessage } from "./encryption.js";

export const encryptAllExistingMessages = async () => {
    try {
        console.log('\n' + '='.repeat(60));
        console.log('STARTING MESSAGE ENCRYPTION MIGRATION');
        console.log('='.repeat(60) + '\n');

        const allMessages = await Message.find({});
        console.log(`Found ${allMessages.length} messages to process\n`);

        let encryptedCount = 0;
        let alreadyEncryptedCount = 0;
        let processedCount = 0;

        for (const message of allMessages) {
            processedCount++;
            
            // Check if already encrypted
            if (typeof message.message === 'string' && message.message.startsWith('U2FsdGVkX')) {
                alreadyEncryptedCount++;
                if (processedCount <= 5 || processedCount % 10 === 0) {
                    console.log(`[${processedCount}/${allMessages.length}] ⏭️  Already encrypted`);
                }
            } else {
                // Encrypt the message
                const originalMessage = message.message;
                const encryptedMessage = encryptMessage(originalMessage);
                
                // Update in database
                message.message = encryptedMessage;
                await message.save();
                
                encryptedCount++;
                if (processedCount <= 5 || processedCount % 10 === 0) {
                    console.log(`[${processedCount}/${allMessages.length}] ✅ Encrypted: "${originalMessage.substring(0, 20)}..."`);
                }
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('ENCRYPTION COMPLETE!');
        console.log('='.repeat(60));
        console.log(`Total messages processed: ${processedCount}`);
        console.log(`Newly encrypted: ${encryptedCount}`);
        console.log(`Already encrypted: ${alreadyEncryptedCount}`);
        console.log(`Total encrypted: ${encryptedCount + alreadyEncryptedCount}/${allMessages.length}`);
        console.log('='.repeat(60) + '\n');

        return {
            success: true,
            processed: processedCount,
            encrypted: encryptedCount,
            alreadyEncrypted: alreadyEncryptedCount
        };
    } catch (error) {
        console.error('❌ Encryption error:', error);
        return {
            success: false,
            error: error.message
        };
    }
};
