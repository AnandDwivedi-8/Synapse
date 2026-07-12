import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { setSelectedUser } from '@/redux/authSlice';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { MessageCircleCode, Edit, Phone, Video, Info } from 'lucide-react';
import Messages from './Messages';
import API from '@/lib/axios';
import { setMessages, clearUnreadMessages } from '@/redux/chatSlice';
import { toast } from 'sonner';
import { useTheme } from '@/context/ThemeContext';
import useGetConversations from '@/hooks/useGetConversations';

const ChatPage = () => {
    useGetConversations();
    const [textMessage, setTextMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [conversationCache, setConversationCache] = useState({});
    const { user, suggestedUsers, selectedUser } = useSelector(store => store.auth);
    const chatState = useSelector(store => store.chat);
    const onlineUsers = chatState?.onlineUsers || [];
    const messages = chatState?.messages || [];
    const unreadMessages = chatState?.unreadMessages || {};
    const { isDark } = useTheme();
    const dispatch = useDispatch();



    const sendMessageHandler = async (receiverId) => {
        console.log('📤 sendMessageHandler called with receiverId:', receiverId);
        console.log('📝 Current message:', textMessage);
        console.log('👤 Selected user:', selectedUser);
        
        if (!receiverId) {
            console.error('❌ No receiver ID provided');
            toast.error("No user selected");
            return;
        }
        
        if (!textMessage.trim()) {
            console.warn('⚠️ Message is empty');
            toast.error("Message cannot be empty");
            return;
        }
        
        try {
            setIsLoading(true);
            console.log('🚀 Sending POST request to /message/send/' + receiverId);
            const res = await API.post(`/message/send/${receiverId}`, { textMessage });
            console.log('✅ Response received:', res.data);
            
            if (res.data.success) {
                console.log('💾 Message saved successfully');
                dispatch(setMessages([...messages, res.data.newMessage]));
                setTextMessage("");
                toast.success("Message sent!");
            } else {
                console.warn('⚠️ Response success is false:', res.data);
                toast.error(res.data.message || "Failed to send message");
            }
        } catch (error) {
            console.error("❌ Error sending message:", error);
            const errorMsg = error?.response?.data?.message || error?.message || "Failed to send message";
            console.error('Error details:', {
                status: error?.response?.status,
                statusText: error?.response?.statusText,
                data: error?.response?.data,
                message: errorMsg
            });
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    }

    const handleKeyPress = (e, receiverId) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessageHandler(receiverId);
        }
    }

    const handleSelectUser = (user) => {
        dispatch(setSelectedUser(user));
        dispatch(clearUnreadMessages({ userId: user._id }));
        // Fetch messages for this user
        fetchMessages(user._id);
    }

    const fetchMessages = async (receiverId) => {
        try {
            const res = await API.get(`/message/all/${receiverId}`);
            if (res.data.success) {
                dispatch(setMessages(res.data.messages || []));
            }
        } catch (error) {
            console.log("Error fetching messages:", error);
        }
    }

    useEffect(() => {
        // If a user is already selected (from navigation), auto-select them in the list
        if (selectedUser?._id && suggestedUsers && suggestedUsers.length > 0) {
            const userExists = suggestedUsers.find(u => u._id === selectedUser._id);
            if (userExists) {
                // User is in the list, messages will be fetched by the other useEffect
                return;
            }
        }
    }, [selectedUser?._id, suggestedUsers]);

    useEffect(() => {
        // If a user is already selected (from navigation), fetch their messages
        if (selectedUser?._id) {
            fetchMessages(selectedUser._id);
        }
    }, [selectedUser?._id]);

    useEffect(() => {
        return () => {
            dispatch(setSelectedUser(null));
        }
    },[]);

    return (
        <div className='flex ml-[16%] h-screen' style={{ backgroundColor: 'var(--bg-primary)' }}>
            {/* LEFT SIDEBAR - CONVERSATIONS LIST */}
            <section className='w-full md:w-80 border-r' style={{ 
                backgroundColor: 'var(--bg-primary)', 
                color: 'var(--text-primary)',
                borderColor: 'var(--border-color)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Header */}
                <div className='p-4 sticky top-0 z-20' style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <div className='flex items-center justify-between mb-4'>
                        <h1 className='text-2xl font-bold'>Direct</h1>
                        <Button variant='ghost' size='icon' className='hover:opacity-70'>
                            <Edit size={20} style={{ color: 'var(--text-primary)' }} />
                        </Button>
                    </div>
                </div>

                {/* Conversations List */}
                <div className='flex-1 overflow-y-auto'>
                    {/* Display conversations */}
                    {suggestedUsers && Array.isArray(suggestedUsers) && suggestedUsers.length > 0 ? (
                        // Show conversations
                        suggestedUsers.map((suggestedUser) => {
                            if (!suggestedUser?._id) return null;
                            
                            const isOnline = Array.isArray(onlineUsers) && onlineUsers.includes(suggestedUser?._id);
                            const isSelected = selectedUser?._id === suggestedUser?._id;
                            const hasUnread = unreadMessages && unreadMessages[suggestedUser?._id] > 0;
                            
                            // Only show messages from the current conversation
                            const userMessages = isSelected && Array.isArray(messages) ? messages : [];
                            const lastMessage = userMessages.length > 0 ? userMessages[userMessages.length - 1]?.message : null;
                            const lastMessageTime = userMessages.length > 0 ? '2h' : null;

                            return (
                                <div 
                                    key={suggestedUser?._id}
                                    onClick={() => handleSelectUser(suggestedUser)} 
                                    className='flex items-center gap-3 px-4 py-3 cursor-pointer transition-all relative'
                                    style={{
                                        backgroundColor: isSelected ? 'var(--input-bg)' : 'transparent',
                                    }}
                                    onMouseEnter={(e) => !isSelected && (e.currentTarget.style.backgroundColor = 'var(--hover-bg)')}
                                    onMouseLeave={(e) => !isSelected && (e.currentTarget.style.backgroundColor = 'transparent')}
                                >
                                    {/* Avatar with online indicator */}
                                    <div className='relative'>
                                        <Avatar className='w-12 h-12'>
                                            <AvatarImage src={suggestedUser?.profilePicture} />
                                            <AvatarFallback>{suggestedUser?.username?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        {isOnline && (
                                            <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white' style={{ borderColor: 'var(--bg-primary)' }} />
                                        )}
                                        {/* Red dot for unread messages */}
                                        {hasUnread && (
                                            <div className='absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full' style={{ boxShadow: '0 0 8px rgba(239, 68, 68, 0.8)' }} />
                                        )}
                                    </div>

                                    {/* Message Info */}
                                    <div className='flex-1 min-w-0'>
                                        <div className='flex justify-between items-baseline gap-2'>
                                            <span className='font-semibold text-sm truncate'>{suggestedUser?.username}</span>
                                            {lastMessageTime && <span className='text-xs opacity-60'>{lastMessageTime}</span>}
                                        </div>
                                        <p className='text-xs opacity-60 truncate' style={{ color: 'var(--text-secondary)' }}>
                                            {lastMessage || 'Tap to message'}
                                        </p>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div className='flex flex-col items-center justify-center h-full' style={{ color: 'var(--text-secondary)' }}>
                            <p className='text-sm'>No conversations yet</p>
                        </div>
                    )}
                </div>
            </section>
            {/* RIGHT SIDE - MESSAGE VIEW */}
            {selectedUser ? (
                <section className='flex-1 flex flex-col h-full' style={{ backgroundColor: 'var(--bg-primary)' }}>
                    {/* Chat Header */}
                    <div className='flex items-center justify-between px-4 py-3 sticky top-0 z-10' style={{ 
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-primary)'
                    }}>
                        <div className='flex items-center gap-3'>
                            <Avatar>
                                <AvatarImage src={selectedUser?.profilePicture} alt='profile' />
                                <AvatarFallback>{selectedUser?.username?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className='flex flex-col'>
                                <span className='font-semibold'>{selectedUser?.username}</span>
                                <span className='text-xs opacity-60' style={{ color: 'var(--text-secondary)' }}>
                                    {onlineUsers.includes(selectedUser?._id) ? 'Active now' : 'Offline'}
                                </span>
                            </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className='flex items-center gap-2'>
                            <Button variant='ghost' size='icon' className='hover:opacity-70'>
                                <Phone size={20} style={{ color: 'var(--text-primary)' }} />
                            </Button>
                            <Button variant='ghost' size='icon' className='hover:opacity-70'>
                                <Video size={20} style={{ color: 'var(--text-primary)' }} />
                            </Button>
                            <Button variant='ghost' size='icon' className='hover:opacity-70'>
                                <Info size={20} style={{ color: 'var(--text-primary)' }} />
                            </Button>
                        </div>
                    </div>

                    {/* Messages */}
                    <Messages selectedUser={selectedUser} />

                    {/* Input Area */}
                    <div className='flex items-end p-4 gap-2 relative' style={{ 
                        borderTop: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-primary)'
                    }}>
                        <Input 
                            value={textMessage} 
                            onChange={(e) => setTextMessage(e.target.value)}
                            onKeyPress={(e) => handleKeyPress(e, selectedUser?._id)}
                            type="text" 
                            className='flex-1 rounded-full focus-visible:ring-transparent' 
                            placeholder="Aa..." 
                            disabled={isLoading}
                            style={{ 
                                backgroundColor: 'var(--input-bg)', 
                                color: 'var(--text-primary)',
                                borderColor: 'var(--border-color)',
                                borderRadius: '20px',
                                padding: '10px 16px'
                            }}
                        />
                        <Button 
                            onClick={() => {
                                console.log('🔘 Send button clicked!');
                                console.log('Selected user:', selectedUser);
                                sendMessageHandler(selectedUser?._id);
                            }}
                            disabled={isLoading || !textMessage.trim()}
                            className='rounded-full w-10 h-10 flex items-center justify-center'
                            style={{
                                backgroundColor: textMessage.trim() ? '#0095f6' : 'transparent',
                                color: 'white',
                                opacity: isLoading ? 0.5 : 1
                            }}
                        >
                            →
                        </Button>
                    </div>
                </section>
            ) : (
                <div className='flex-1 flex flex-col items-center justify-center' style={{ 
                    backgroundColor: 'var(--bg-primary)', 
                    color: 'var(--text-primary)'
                }}>
                    <MessageCircleCode className='w-20 h-20 mb-4 opacity-60' />
                    <h1 className='text-xl font-semibold'>Your messages</h1>
                    <p className='text-sm opacity-60' style={{ color: 'var(--text-secondary)' }}>
                        Send a message to start a chat.
                    </p>
                </div>
            )}
        </div>
    )
}

export default ChatPage