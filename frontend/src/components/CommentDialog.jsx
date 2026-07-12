import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Link } from 'react-router-dom'
import { MoreHorizontal } from 'lucide-react'
import { Button } from './ui/button'
import { useDispatch, useSelector } from 'react-redux'
import Comment from './Comment'
import API from '@/lib/axios'
import { toast } from 'sonner'
import { setPosts } from '@/redux/postSlice'

const CommentDialog = ({ open, setOpen }) => {
  const [text, setText] = useState("");
  const { selectedPost, posts } = useSelector(store => store.post);
  const [comment, setComment] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    if (selectedPost) {
      setComment(selectedPost.comments);
    }
  }, [selectedPost]);

  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    if (inputText.trim()) {
      setText(inputText);
    } else {
      setText("");
    }
  }

  const sendMessageHandler = async () => {
    try {
      const res = await API.post(`/post/${selectedPost?._id}/comment`, { text });

      if (res.data.success) {
        const updatedCommentData = [...comment, res.data.comment];
        setComment(updatedCommentData);

        const updatedPostData = posts.map(p =>
          p._id === selectedPost._id ? { ...p, comments: updatedCommentData } : p
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
        setText("");
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to post comment');
    }
  }

  const handleDeleteComment = (commentId) => {
    const updatedComments = comment.filter(c => c._id !== commentId);
    setComment(updatedComments);

    const updatedPostData = posts.map(p =>
      p._id === selectedPost._id ? { ...p, comments: updatedComments } : p
    );
    dispatch(setPosts(updatedPostData));
  }

  const handleUpdateComment = (commentId, newText) => {
    const updatedComments = comment.map(c =>
      c._id === commentId ? { ...c, text: newText } : c
    );
    setComment(updatedComments);

    const updatedPostData = posts.map(p =>
      p._id === selectedPost._id ? { ...p, comments: updatedComments } : p
    );
    dispatch(setPosts(updatedPostData));
  }

  return (
    <Dialog open={open}>
      <DialogContent 
        onInteractOutside={() => setOpen(false)} 
        className="max-w-5xl p-0 flex flex-col"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
          color: 'var(--text-primary)'
        }}
      >
        <div className='flex flex-1'>
          <div className='w-1/2'>
            <img
              src={selectedPost?.image}
              alt="post_img"
              className='w-full h-full object-cover rounded-l-lg'
            />
          </div>
          <div className='w-1/2 flex flex-col justify-between' style={{ backgroundColor: 'var(--card-bg)' }}>
            <div className='flex items-center justify-between p-4' style={{ borderBottom: '1px solid var(--border-color)' }}>
              <div className='flex gap-3 items-center'>
                <Link>
                  <Avatar>
                    <AvatarImage src={selectedPost?.author?.profilePicture} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <Link className='font-semibold text-xs' style={{ color: 'var(--text-primary)' }}>{selectedPost?.author?.username}</Link>
                </div>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <MoreHorizontal className='cursor-pointer' style={{ color: 'var(--text-secondary)' }} />
                </DialogTrigger>
                <DialogContent 
                  className="flex flex-col items-center text-sm text-center"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--card-border)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <div className='cursor-pointer w-full text-red-600 font-bold hover:opacity-70'>
                    Unfollow
                  </div>
                  <div className='cursor-pointer w-full hover:opacity-70'>
                    Add to favorites
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className='flex-1 overflow-y-auto max-h-96 p-4'>
              {
                comment.length > 0 ? (
                  comment.map((comment) => (
                    <div key={comment._id} className='group'>
                      <Comment 
                        comment={comment}
                        onDelete={handleDeleteComment}
                        onUpdate={handleUpdateComment}
                      />
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'var(--text-secondary)' }} className='text-center text-sm py-8'>
                    No comments yet. Be the first to comment!
                  </p>
                )
              }
            </div>
            <div 
              className='p-4'
              style={{ borderTop: '1px solid var(--border-color)' }}
            >
              <div className='flex items-center gap-2'>
                <input 
                  type="text" 
                  value={text} 
                  onChange={changeEventHandler} 
                  placeholder='Add a comment...' 
                  className='w-full outline-none text-sm p-2 rounded transition-colors duration-300'
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    borderColor: 'var(--input-border)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--input-border)'
                  }}
                />
                <Button 
                  disabled={!text.trim()} 
                  onClick={sendMessageHandler} 
                  className='bg-blue-500 hover:bg-blue-600 text-white'
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CommentDialog