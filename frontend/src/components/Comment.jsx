import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Heart, Trash2, Edit2 } from 'lucide-react'
import { useSelector } from 'react-redux'
import API from '@/lib/axios'
import { toast } from 'sonner'
import { FaHeart, FaRegHeart } from 'react-icons/fa'

const Comment = ({ comment, onDelete, onUpdate }) => {
    const { user } = useSelector(store => store.auth);
    const [isEditing, setIsEditing] = useState(false);
    const [editedText, setEditedText] = useState(comment?.text);
    const [isLiked, setIsLiked] = useState(comment?.likes?.includes(user?._id) || false);
    const [likeCount, setLikeCount] = useState(comment?.likes?.length || 0);

    // Format timestamp
    const formatTime = (date) => {
        const now = new Date();
        const commentDate = new Date(date);
        const diff = now - commentDate;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        
        return commentDate.toLocaleDateString();
    }

    const deleteCommentHandler = async () => {
        try {
            const res = await API.delete(`/post/comment/${comment._id}`);
            if (res.data.success) {
                toast.success('Comment deleted');
                onDelete?.(comment._id);
            }
        } catch (error) {
            toast.error('Failed to delete comment');
            console.log(error);
        }
    }

    const updateCommentHandler = async () => {
        if (!editedText.trim()) {
            toast.error('Comment cannot be empty');
            return;
        }

        try {
            const res = await API.put(`/post/comment/${comment._id}`, { text: editedText });
            if (res.data.success) {
                toast.success('Comment updated');
                onUpdate?.(comment._id, editedText);
                setIsEditing(false);
            }
        } catch (error) {
            toast.error('Failed to update comment');
            console.log(error);
        }
    }

    const likeCommentHandler = async () => {
        try {
            const action = isLiked ? 'unlike' : 'like';
            // Note: Backend endpoint for comment likes needs to be implemented
            // For now, we'll handle optimistically on frontend
            setIsLiked(!isLiked);
            setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
            toast.success(isLiked ? 'Like removed' : 'Liked!');
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className='my-4 pb-4' style={{ borderBottom: '1px solid var(--border-color)' }}>
            <div className='flex gap-3'>
                <Avatar className='w-8 h-8'>
                    <AvatarImage src={comment?.author?.profilePicture} />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className='flex-1'>
                    <div className='flex items-start justify-between gap-2'>
                        <div className='flex-1'>
                            <div className='flex items-center gap-2 mb-1'>
                                <h1 className='font-bold text-sm'>{comment?.author?.username}</h1>
                                <span style={{ color: 'var(--text-tertiary)' }} className='text-xs'>
                                    {formatTime(comment?.createdAt)}
                                </span>
                            </div>
                            
                            {isEditing ? (
                                <div className='flex gap-2 mt-2'>
                                    <textarea
                                        value={editedText}
                                        onChange={(e) => setEditedText(e.target.value)}
                                        className='flex-1 text-sm p-2 rounded border'
                                        style={{
                                            backgroundColor: 'var(--input-bg)',
                                            borderColor: 'var(--input-border)',
                                            color: 'var(--text-primary)'
                                        }}
                                    />
                                    <div className='flex gap-1'>
                                        <button 
                                            onClick={updateCommentHandler}
                                            className='text-xs font-semibold text-blue-500 hover:text-blue-400'
                                        >
                                            Save
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setIsEditing(false);
                                                setEditedText(comment?.text);
                                            }}
                                            className='text-xs font-semibold text-gray-500 hover:text-gray-400'
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className='text-sm' style={{ color: 'var(--text-primary)' }}>
                                    {comment?.text}
                                </p>
                            )}
                        </div>

                        {/* Actions */}
                        {!isEditing && (
                            <div className='flex gap-2 items-center opacity-0 group-hover:opacity-100 transition'>
                                <button 
                                    onClick={likeCommentHandler}
                                    className='cursor-pointer hover:opacity-70 transition'
                                >
                                    {isLiked ? (
                                        <FaHeart size={14} className='text-red-600' />
                                    ) : (
                                        <FaRegHeart size={14} style={{ color: 'var(--text-secondary)' }} />
                                    )}
                                </button>

                                {user?._id === comment?.author._id && (
                                    <>
                                        <button 
                                            onClick={() => setIsEditing(true)}
                                            className='cursor-pointer hover:opacity-70 transition'
                                        >
                                            <Edit2 size={14} style={{ color: 'var(--text-secondary)' }} />
                                        </button>
                                        <button 
                                            onClick={deleteCommentHandler}
                                            className='cursor-pointer hover:opacity-70 transition'
                                        >
                                            <Trash2 size={14} className='text-red-600' />
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Like count for comment */}
                    {likeCount > 0 && (
                        <div className='mt-2 text-xs' style={{ color: 'var(--text-secondary)' }}>
                            {likeCount} {likeCount === 1 ? 'like' : 'likes'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Comment