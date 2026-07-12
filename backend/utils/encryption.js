import CryptoJS from 'crypto-js';

// Use a strong encryption key from environment or default
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'synapse_secure_message_encryption_key_12345';

/**
 * Encrypt message text
 * @param {string} message - Plain text message
 * @returns {string} Encrypted message
 */
export const encryptMessage = (message) => {
    if (!message) return message;
    try {
        const encrypted = CryptoJS.AES.encrypt(message, ENCRYPTION_KEY).toString();
        return encrypted;
    } catch (error) {
        console.error('Encryption error:', error);
        return message;
    }
};

/**
 * Decrypt message text - handles both encrypted and plain text
 * @param {string} encryptedMessage - Encrypted or plain text message
 * @returns {string} Decrypted message
 */
export const decryptMessage = (encryptedMessage) => {
    if (!encryptedMessage) return encryptedMessage;
    try {
        // Check if message looks encrypted (starts with 'U2FsdGVkX')
        if (typeof encryptedMessage === 'string' && encryptedMessage.startsWith('U2FsdGVkX')) {
            const decrypted = CryptoJS.AES.decrypt(encryptedMessage, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
            return decrypted || encryptedMessage; // Return original if decryption fails
        }
        // Return as-is if it doesn't look encrypted (backward compatibility)
        return encryptedMessage;
    } catch (error) {
        console.error('Decryption error:', error);
        // Return original message if decryption fails
        return encryptedMessage;
    }
};

