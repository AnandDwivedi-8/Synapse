import React, { useState, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Dialog, DialogContent, DialogTrigger, DialogHeader } from './ui/dialog'
import { Bookmark, MessageCircle, MoreHorizontal, Send, X } from 'lucide-react'
import { Button } from './ui/button'
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentDialog from './CommentDialog'
import { useDispatch, useSelector } from 'react-redux'
import API from '@/lib/axios'
import { toast } from 'sonner'
import { setPosts, setSelectedPost } from '@/redux/postSlice'
import { Badge } from './ui/badge'

const Post = ({ post }) => {
    const [text, setText] = useState("");
    const [open, setOpen] = useState(false);
    const [showLikesModal, setShowLikesModal] = useState(false);
    const [likes, setLikes] = useState([]);
    const { user } = useSelector(store => store.auth);
    const { posts } = useSelector(store => store.post);
    const [liked, setLiked] = useState(post.likes.includes(user?._id) || false);
    const [postLike, setPostLike] = useState(post.likes.length);
    const [comment, setComment] = useState(post.comments);
    const [animatingLike, setAnimatingLike] = useState(false);
    const lastTapRef = useRef(0);
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        const inputText = e.target.value;
        if (inputText.trim()) {
            setText(inputText);
        } else {
            setText("");
        }
    }

    const likeOrDislikeHandler = async () => {
        try {
            const action = liked ? 'dislike' : 'like';
            const res = await API.get(`/post/${post._id}/${action}`);
            if (res.data.success) {
                const updatedLikes = liked ? postLike - 1 : postLike + 1;
                setPostLike(updatedLikes);
                setLiked(!liked);
                setAnimatingLike(true);
                setTimeout(() => setAnimatingLike(false), 600);

                // apne post ko update krunga
                const updatedPostData = posts.map(p =>
                    p._id === post._id ? {
                        ...p,
                        likes: liked ? p.likes.filter(id => id !== user._id) : [...p.likes, user._id]
                    } : p
                );
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error('Failed to like/unlike post');
        }
    }

    // Double tap to like
    const handleImageDoubleClick = () => {
        const now = Date.now();
        if (now - lastTapRef.current < 300 && !liked) {
            // Double tap detected
            likeOrDislikeHandler();
        }
        lastTapRef.current = now;
    }

    // Fetch likes for modal
    const fetchLikes = async () => {
        try {
            const res = await API.get(`/post/${post._id}/likes`);
            if (res.data.success) {
                setLikes(res.data.likes || []);
            }
        } catch (error) {
            console.log(error);
            toast.error('Failed to fetch likes');
        }
    }

    const handleShowLikes = () => {
        fetchLikes();
        setShowLikesModal(true);
    }

    const commentHandler = async () => {

        try {
                const res = await API.post(`/post/${post._id}/comment`, { text });
            console.log(res.data);
            if (res.data.success) {
                const updatedCommentData = [...comment, res.data.comment];
                setComment(updatedCommentData);

                const updatedPostData = posts.map(p =>
                    p._id === post._id ? { ...p, comments: updatedCommentData } : p
                );

                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
                setText("");
            }
        } catch (error) {
            console.log(error);
        }
    }

    const deletePostHandler = async () => {
        try {
                const res = await API.delete(`/post/delete/${post?._id}`);
            if (res.data.success) {
                const updatedPostData = posts.filter((postItem) => postItem?._id !== post?._id);
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.messsage);
        }
    }

    const bookmarkHandler = async () => {
        try {
                const res = await API.get(`/post/${post?._id}/bookmark`);
            if(res.data.success){
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
        }
    }
    return (
        <div style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--card-border)',
            color: 'var(--text-primary)'
        }} className='my-6 w-full max-w-2xl mx-auto rounded-lg border overflow-hidden transition-colors duration-300'>
            {/* Post Header */}
            <div style={{
                borderColor: 'var(--border-color)'
            }} className='flex items-center justify-between p-3 border-b'>
                <div className='flex items-center gap-3'>
                    <Avatar className='w-10 h-10'>
                        <AvatarImage src={post.author?.profilePicture} alt="post_image" />
                        <AvatarFallback className='bg-gradient-to-br from-pink-500 to-orange-400'>{post.author?.username?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className='flex items-center gap-2'>
                        <h1 className='font-semibold text-sm hover:opacity-70 cursor-pointer' style={{ color: 'var(--text-primary)' }}>{post.author?.username}</h1>
                       {user?._id === post.author._id &&  <Badge variant="secondary" className='text-xs'>Author</Badge>}
                    </div>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <MoreHorizontal className='cursor-pointer hover:opacity-70' style={{ color: 'var(--text-secondary)' }} size={20} />
                    </DialogTrigger>
                    <DialogContent style={{
                        backgroundColor: 'var(--card-bg)',
                        borderColor: 'var(--card-border)',
                        color: 'var(--text-primary)'
                    }} className="flex flex-col items-center text-sm text-center border">
                        {
                        post?.author?._id !== user?._id && <Button variant='ghost' className="cursor-pointer w-fit text-red-600 font-bold hover:opacity-70">Unfollow</Button>
                        }
                        
                        <Button variant='ghost' className="cursor-pointer w-fit hover:opacity-70">Add to favorites</Button>
                        {
                            user && user?._id === post?.author._id && <Button onClick={deletePostHandler} variant='ghost' className="cursor-pointer w-fit text-red-600 hover:opacity-70">Delete</Button>
                        }
                    </DialogContent>
                </Dialog>
            </div>

            {/* Post Image */}
            <div 
                className='w-full aspect-square object-cover relative overflow-hidden cursor-pointer group'
                onDoubleClick={handleImageDoubleClick}
            >
                <img
                    className='w-full h-full object-cover'
                    src={post.image}
                    alt="post_img"
                />
                {/* Double tap like animation */}
                {animatingLike && !liked && (
                    <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                        <FaHeart 
                            size={100} 
                            className='text-red-600 animate-pulse'
                            style={{
                                animation: 'pulse 0.6s ease-out',
                                opacity: 0
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Post Actions */}
            <div className='p-3 border-b border-gray-800'>
                <div className='flex items-center justify-between mb-3'>
                    <div className='flex items-center gap-4'>
                        {
                            liked ? (
                                <FaHeart 
                                    onClick={likeOrDislikeHandler} 
                                    size={22} 
                                    className='cursor-pointer text-red-600 hover:opacity-80 transition'
                                    style={{
                                        animation: liked && animatingLike ? 'scale 0.3s ease-out' : 'none'
                                    }}
                                />
                            ) : (
                                <FaRegHeart 
                                    onClick={likeOrDislikeHandler} 
                                    size={22} 
                                    className='cursor-pointer hover:text-gray-400 transition' 
                                    style={{ color: 'var(--text-secondary)' }}
                                />
                            )
                        }
                        <MessageCircle 
                            onClick={() => {
                                dispatch(setSelectedPost(post));
                                setOpen(true);
                            }} 
                            size={22}
                            className='cursor-pointer hover:opacity-70 transition'
                            style={{ color: 'var(--text-secondary)' }}
                        />
                        <Send size={22} className='cursor-pointer hover:opacity-70 transition' style={{ color: 'var(--text-secondary)' }} />
                    </div>
                    <Bookmark onClick={bookmarkHandler} size={22} className='cursor-pointer hover:opacity-70 transition' style={{ color: 'var(--text-secondary)' }} />
                </div>

                {/* Likes Count - Clickable */}
                <span 
                    onClick={handleShowLikes}
                    style={{ color: 'var(--text-primary)' }} 
                    className='font-semibold text-sm block cursor-pointer hover:opacity-70'
                >
                    {postLike} {postLike === 1 ? 'like' : 'likes'}
                </span>
            </div>

            {/* Post Caption */}
            <div style={{
                borderColor: 'var(--border-color)'
            }} className='p-3 border-b'>
                <p className='text-sm' style={{ color: 'var(--text-primary)' }}>
                    <span className='font-semibold mr-2 hover:opacity-70 cursor-pointer'>{post.author?.username}</span>
                    <span style={{ color: 'var(--text-primary)' }}>{post.caption}</span>
                </p>
            </div>

            {/* Comments Preview */}
            {
                comment.length > 0 && (
                    <div className='px-3 pt-3 pb-2'>
                        <span 
                            onClick={() => {
                                dispatch(setSelectedPost(post));
                                setOpen(true);
                            }} 
                            className='cursor-pointer text-sm hover:opacity-70 transition'
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            View all {comment.length} {comment.length === 1 ? 'comment' : 'comments'}
                        </span>
                    </div>
                )
            }
            
            <CommentDialog open={open} setOpen={setOpen} />

            {/* Likes Modal */}
            <Dialog open={showLikesModal} onOpenChange={setShowLikesModal}>
                <DialogContent style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--card-border)',
                    color: 'var(--text-primary)'
                }} className="border max-w-md">
                    <DialogHeader className="flex items-center justify-between">
                        <span className='font-semibold'>Likes</span>
                    </DialogHeader>
                    <div className='max-h-96 overflow-y-auto'>
                        {likes.length > 0 ? (
                            likes.map((liker) => (
                                <div 
                                    key={liker._id}
                                    className='flex items-center gap-3 p-3 hover:bg-gray-900 rounded-md cursor-pointer transition'
                                >
                                    <Avatar className='w-10 h-10'>
                                        <AvatarImage src={liker.profilePicture} />
                                        <AvatarFallback>{liker.username?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className='flex-1'>
                                        <p className='font-semibold text-sm'>{liker.username}</p>
                                        <p style={{ color: 'var(--text-secondary)' }} className='text-xs'>{liker.bio || 'No bio'}</p>
                                    </div>
                                    {user?._id !== liker._id && (
                                        <Button size='sm' variant='outline' className='text-xs'>
                                            Follow
                                        </Button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p style={{ color: 'var(--text-secondary)' }} className='text-center py-8'>
                                No likes yet
                            </p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add Comment Section */}
            <div style={{
                borderColor: 'var(--border-color)'
            }} className='px-3 py-3 border-t flex items-center gap-2'>
                <input
                    type="text"
                    placeholder='Add a comment...'
                    value={text}
                    onChange={changeEventHandler}
                    className='outline-none text-sm w-full bg-transparent placeholder-opacity-70 transition-colors duration-300'
                    style={{
                        color: 'var(--input-text)',
                        borderColor: 'var(--input-border)'
                    }}
                />
                {
                    text && (
                        <span 
                            onClick={commentHandler} 
                            className='text-blue-500 hover:text-blue-400 cursor-pointer font-semibold text-sm transition'
                        >
                            Post
                        </span>
                    )
                }
            </div>
        </div>
    )
}

export default Post