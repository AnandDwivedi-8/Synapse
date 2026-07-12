import {Conversation} from "../models/conversation.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import {Message} from "../models/message.model.js"
import { encryptMessage, decryptMessage } from "../utils/encryption.js";

// Get all conversations for current user
export const getUserConversations = async (req, res) => {
    try {
        const userId = req.id;
        console.log('=== getUserConversations called ===');
        console.log('Current user ID:', userId);
        
        // Find all conversations this user is in
        const conversations = await Conversation.find({
            participants: userId
        });
        
        console.log('Raw conversations found:', conversations.length);
        console.log('Conversations:', JSON.stringify(conversations, null, 2));
        
        // Now populate the data
        const populatedConversations = await Conversation.find({
            participants: userId
        })
        .populate({
            path: 'participants',
            select: 'username profilePicture _id bio gender email'
        })
        .populate({
            path: 'messages',
            select: 'message senderId receiverId createdAt'
        })
        .sort({ createdAt: -1 });
        
        console.log('Populated conversations:', populatedConversations.length);

        // Transform conversations to include last message info
        const transformedConversations = populatedConversations.map(conv => {
            console.log('Processing conversation:', conv._id);
            console.log('Participants:', conv.participants.map(p => ({ id: p._id, username: p.username })));
            
            const otherUser = conv.participants.find(p => {
                const pIdStr = p._id ? p._id.toString() : '';
                const userIdStr = userId.toString ? userId.toString() : userId;
                console.log('Comparing:', pIdStr, '!==', userIdStr, '=', pIdStr !== userIdStr);
                return pIdStr !== userIdStr;
            });
            
            const lastMessage = conv.messages && conv.messages.length > 0 ? conv.messages[conv.messages.length - 1] : null;
            
            return {
                conversationId: conv._id,
                user: otherUser,
                lastMessage: lastMessage ? decryptMessage(lastMessage.message) : '',
                lastMessageTime: lastMessage?.createdAt,
                messageCount: conv.messages ? conv.messages.length : 0
            };
        });

        console.log('Returning transformed conversations:', transformedConversations.length);
        console.log('Data:', JSON.stringify(transformedConversations, null, 2));
        
        return res.status(200).json({
            success: true,
            conversations: transformedConversations
        });
    } catch (error) {
        console.error('=== Error in getUserConversations ===');
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error?.message || 'Failed to fetch conversations',
            error: error.toString()
        });
    }
}

// for chatting
export const sendMessage = async (req,res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const {textMessage:message} = req.body;
        
        console.log('=== sendMessage called ===');
        console.log('SenderId:', senderId);
        console.log('ReceiverId:', receiverId);
        console.log('Message:', message);
      
        let conversation = await Conversation.findOne({
            participants:{$all:[senderId, receiverId]}
        });
        // establish the conversation if not started yet.
        if(!conversation){
            conversation = await Conversation.create({
                participants:[senderId, receiverId]
            })
            console.log('New conversation created:', conversation._id);
        };
        
        // Encrypt the message before saving
        const encryptedMessage = encryptMessage(message);
        console.log('Message encrypted, starts with:', encryptedMessage.substring(0, 20));
        
        const newMessage = await Message.create({
            senderId,
            receiverId,
            message: encryptedMessage,
            createdAt: new Date() // Explicitly set server time
        });
        console.log('Message created:', newMessage._id);
        
        if(newMessage) conversation.messages.push(newMessage._id);

        await Promise.all([conversation.save(),newMessage.save()])
        console.log('Message and conversation saved');

        // Decrypt for real-time emit (so receiver sees decrypted text)
        const decryptedMessage = decryptMessage(newMessage.message);
        const messageToEmit = {
            ...newMessage.toObject(),
            message: decryptedMessage
        };

        // implement socket io for real time data transfer
        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit('newMessage', messageToEmit);
        }

        return res.status(201).json({
            success:true,
            newMessage: messageToEmit
        })
    } catch (error) {
        console.log('Error in sendMessage:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to send message',
            error: error.message
        });
    }
}
export const getMessage = async (req,res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const conversation = await Conversation.findOne({
            participants:{$all: [senderId, receiverId]}
        }).populate('messages');
        if(!conversation) return res.status(200).json({success:true, messages:[]});

        // Decrypt all messages before returning
        const decryptedMessages = conversation.messages.map(msg => ({
            ...msg.toObject(),
            message: decryptMessage(msg.message)
        }));

        return res.status(200).json({success:true, messages:decryptedMessages});
        
    } catch (error) {
        console.log(error);
    }
}

// Delete message
export const deleteMessage = async (req, res) => {
    try {
        const messageId = req.params.id;
        const userId = req.id;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: 'Message not found', success: false });
        }

        // Check if user is the sender
        if (message.senderId.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized', success: false });
        }

        // Delete message from conversation
        await Conversation.updateMany(
            { messages: messageId },
            { $pull: { messages: messageId } }
        );

        // Delete the message
        await Message.findByIdAndDelete(messageId);

        return res.status(200).json({
            success: true,
            message: 'Message deleted'
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to delete message', success: false });
    }
}

// Update message
export const updateMessage = async (req, res) => {
    try {
        const messageId = req.params.id;
        const userId = req.id;
        const { message: messageText } = req.body;

        if (!messageText || !messageText.trim()) {
            return res.status(400).json({ message: 'Message text is required', success: false });
        }

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: 'Message not found', success: false });
        }

        // Check if user is the sender
        if (message.senderId.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized', success: false });
        }

        // Encrypt the edited message
        message.message = encryptMessage(messageText);
        message.isEdited = true;
        await message.save();

        // Decrypt for response (so sender sees decrypted text)
        const decryptedMessage = {
            ...message.toObject(),
            message: decryptMessage(message.message)
        };

        // Emit socket event to notify receiver
        const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('messageUpdated', decryptedMessage);
        }

        return res.status(200).json({
            success: true,
            message: 'Message updated',
            updatedMessage: decryptedMessage
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to update message', success: false });
    }
}

// Add reaction to message
export const addMessageReaction = async (req, res) => {
    try {
        const messageId = req.params.id;
        const userId = req.id;
        const { emoji } = req.body;

        if (!emoji) {
            return res.status(400).json({ message: 'Emoji is required', success: false });
        }

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: 'Message not found', success: false });
        }

        // Initialize reactions object if not exists
        if (!message.reactions) {
            message.reactions = {};
        }

        // Initialize emoji array if not exists
        if (!message.reactions[emoji]) {
            message.reactions[emoji] = [];
        }

        // Add user to emoji reaction if not already there
        if (!message.reactions[emoji].includes(userId)) {
            message.reactions[emoji].push(userId);
        }

        await message.save();

        // Emit socket event
        const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('messageReaction', { messageId, reactions: message.reactions });
        }

        return res.status(200).json({
            success: true,
            message: 'Reaction added',
            reactions: message.reactions
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to add reaction', success: false });
    }
}