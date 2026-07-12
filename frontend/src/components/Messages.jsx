import React, { useEffect, useRef, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import useGetAllMessage from '@/hooks/useGetAllMessage'
import useGetRTM from '@/hooks/useGetRTM'
import { useTheme } from '@/context/ThemeContext'
import { Trash2, Edit2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader } from './ui/dialog'
import API from '@/lib/axios'
import { toast } from 'sonner'
import { setMessages } from '@/redux/chatSlice'
import { useDispatch } from 'react-redux'
import { formatMessageTime } from '@/lib/utils'

const Messages = ({ selectedUser }) => {
    useGetRTM();
    useGetAllMessage();
    const {messages} = useSelector(store=>store.chat);
    const {user} = useSelector(store=>store.auth);
    const { isDark } = useTheme();
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const [isEditing, setIsEditing] = useState(null);
    const [editText, setEditText] = useState("");
    const [showReactions, setShowReactions] = useState(null);
    const [reactions, setReactions] = useState({});
    const [previousMessageCount, setPreviousMessageCount] = useState(0);
    const dispatch = useDispatch();

    // Only auto-scroll when new messages arrive (not on initial load or edits)
    useEffect(() => {
        if (messages.length > previousMessageCount) {
            // New message arrived, scroll to bottom
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
        setPreviousMessageCount(messages.length);
    }, [messages.length]);

    const deleteMessageHandler = async (messageId) => {
        try {
            const res = await API.delete(`/message/${messageId}`);
            if (res.data.success) {
                const updatedMessages = messages.filter(m => m._id !== messageId);
                dispatch(setMessages(updatedMessages));
                toast.success('Message deleted');
            }
        } catch (error) {
            toast.error('Failed to delete message');
            console.log(error);
        }
    }

    const editMessageHandler = async (messageId) => {
        if (!editText.trim()) {
            toast.error('Message cannot be empty');
            return;
        }

        try {
            const res = await API.put(`/message/${messageId}`, { message: editText });
            if (res.data.success) {
                const updatedMessages = messages.map(m =>
                    m._id === messageId ? { ...m, message: editText, isEdited: true } : m
                );
                dispatch(setMessages(updatedMessages));
                toast.success('Message updated');
                setIsEditing(null);
                setEditText("");
            }
        } catch (error) {
            toast.error('Failed to update message');
            console.log(error);
        }
    }

    const addReactionHandler = async (messageId, emoji) => {
        try {
            const res = await API.post(`/message/${messageId}/react`, { emoji });
            if (res.data.success) {
                const updatedMessages = messages.map(m =>
                    m._id === messageId ? { ...m, reactions: res.data.reactions } : m
                );
                dispatch(setMessages(updatedMessages));
                toast.success('Reaction added');
                setShowReactions(null);
            }
        } catch (error) {
            console.log(error);
            toast.error('Failed to add reaction');
        }
    }

    return (    
        <div ref={messagesContainerRef} className='overflow-y-auto flex-1 p-4' style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            <div className='flex justify-center mb-8'>
                <div className='flex flex-col items-center justify-center text-center'>
                    <Avatar className="h-20 w-20 mb-3">
                        <AvatarImage src={selectedUser?.profilePicture} alt='profile' />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <span className='font-semibold text-lg'>{selectedUser?.username}</span>
                    <p className='text-sm' style={{ color: 'var(--text-secondary)' }}>You matched on Synapse</p>
                    <Link to={`/profile/${selectedUser?._id}`}><Button className="h-8 my-3" variant="secondary">View profile</Button></Link>
                </div>
            </div>
            <div className='flex flex-col gap-3 mb-4'>
                {
                   messages && messages.length > 0 ? (
                        messages.map((msg) => {
                            const isSent = msg.senderId === user?._id;
                            return (
                                <div key={msg._id} className={`flex ${isSent ? 'justify-end' : 'justify-start'} group`}>
                                    <div className={`relative flex flex-col`}>
                                        {isEditing === msg._id ? (
                                            <div className='flex gap-2 mb-2'>
                                                <input
                                                    type="text"
                                                    value={editText}
                                                    onChange={(e) => setEditText(e.target.value)}
                                                    className='p-2 rounded-lg text-sm flex-1'
                                                    style={{
                                                        backgroundColor: 'var(--input-bg)',
                                                        color: 'var(--text-primary)',
                                                        borderColor: 'var(--input-border)',
                                                        border: '1px solid var(--input-border)'
                                                    }}
                                                />
                                                <button 
                                                    onClick={() => editMessageHandler(msg._id)}
                                                    className='text-blue-500 hover:text-blue-400 text-sm font-semibold'
                                                >
                                                    Save
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        setIsEditing(null);
                                                        setEditText("");
                                                    }}
                                                    className='text-gray-500 hover:text-gray-400 text-sm font-semibold'
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <div className={`p-3 rounded-lg max-w-xs break-words text-sm relative`} style={{ 
                                                backgroundColor: isSent ? '#0095f6' : 'var(--input-bg)', 
                                                color: isSent ? '#ffffff' : 'var(--text-primary)'
                                            }}>
                                                <div className='flex items-center justify-between gap-2'>
                                                    <span>{msg.message}</span>
                                                    {isSent && (
                                                        <div className='opacity-0 group-hover:opacity-100 transition flex gap-1 ml-2'>
                                                            <button 
                                                                onClick={() => {
                                                                    setIsEditing(msg._id);
                                                                    setEditText(msg.message);
                                                                }}
                                                                className='hover:opacity-70'
                                                            >
                                                                <Edit2 size={14} />
                                                            </button>
                                                            <button 
                                                                onClick={() => deleteMessageHandler(msg._id)}
                                                                className='hover:opacity-70'
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                {msg.isEdited && (
                                                    <span className='text-xs opacity-70'>(edited)</span>
                                                )}
                                                <div className='text-xs mt-1' style={{ opacity: isSent ? '0.8' : '0.6' }}>
                                                    {formatMessageTime(msg.isEdited ? msg.updatedAt : msg.createdAt)}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Message Reactions */}
                                        {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                                            <div className='flex gap-1 mt-1 text-sm flex-wrap'>
                                                {Object.entries(msg.reactions).map(([emoji, users]) => (
                                                    <span 
                                                        key={emoji}
                                                        className='bg-gray-700 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-600'
                                                        title={users.join(', ')}
                                                    >
                                                        {emoji} {users.length > 1 ? users.length : ''}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Reaction Button - Removed */}
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <div className='flex justify-center items-center h-20' style={{ color: 'var(--text-secondary)' }}>
                            <p className='text-sm'>No messages yet. Start the conversation!</p>
                        </div>
                    )
                }
                <div ref={messagesEndRef} />
            </div>
        </div>  
    )
}

export default Messages