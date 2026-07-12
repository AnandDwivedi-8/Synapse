import React, { useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader } from './ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { readFileAsDataURL } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import API from '@/lib/axios';
import { useDispatch, useSelector } from 'react-redux';
import { setPosts } from '@/redux/postSlice';
import { setAuthUser } from '@/redux/authSlice';

const CreatePost = ({ open, setOpen }) => {
  const imageRef = useRef();
  const [file, setFile] = useState("");
  const [caption, setCaption] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const {user} = useSelector(store=>store.auth);
  const {posts} = useSelector(store=>store.post);
  const dispatch = useDispatch();

  const CAPTION_LIMIT = 2200;
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  const fileChangeHandler = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log('❌ No file selected');
      return;
    }

    // File type validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Only JPG, PNG, GIF, and WebP formats are allowed');
      return;
    }

    // File size validation
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size must be less than 10MB');
      return;
    }

    console.log('✅ File selected:', file.name, file.size, 'bytes', file.type);
    setFile(file);
    const dataUrl = await readFileAsDataURL(file);
    setImagePreview(dataUrl);
    console.log('✅ Image preview set');
    toast.success('Image selected successfully');
  }

  const createPostHandler = async (e) => {
    console.log('🔍 createPostHandler called');
    console.log('   imagePreview:', !!imagePreview);
    console.log('   file:', file?.name, file?.size);
    console.log('   caption:', caption?.substring(0, 30));

    if (!imagePreview) {
      toast.error('Please select an image');
      return;
    }

    if (!caption.trim()) {
      toast.error('Caption cannot be empty');
      return;
    }

    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("image", file);
    
    console.log('📸 Creating post');
    console.log('   File object:', file);
    console.log('   File instanceof File:', file instanceof File);
    console.log('   FormData entries:');
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`     ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
      } else {
        console.log(`     ${key}: "${String(value).substring(0, 50)}..."`);
      }
    }
    
    try {
      setLoading(true);
      const res = await API.post('/post/addpost', formData);
      console.log('📥 Post response:', res.data);
      if (res.data.success) {
        dispatch(setPosts([res.data.post, ...posts]));
        
        // Update user's posts array and RightSidebar post count
        const updatedUser = {
          ...user,
          posts: [res.data.post._id, ...user.posts]
        };
        dispatch(setAuthUser(updatedUser));
        
        toast.success(res.data.message);
        // Clear form on successful post
        setCaption("");
        setFile("");
        setImagePreview("");
        setOpen(false);
      }
    } catch (error) {
      console.log('❌ Post error:', error);
      console.log('❌ Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  }

  const closeDialogHandler = () => {
    // Clear form when closing
    setCaption("");
    setFile("");
    setImagePreview("");
    setOpen(false);
  }
  return (
    <Dialog open={open}>
      <DialogContent onInteractOutside={() => closeDialogHandler()} style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
        color: 'var(--text-primary)'
      }} className='border'>
        <DialogHeader className='text-center font-semibold'>Create New Post</DialogHeader>
        <div className='flex gap-3 items-center'>
          <Avatar>
            <AvatarImage src={user?.profilePicture} alt="img" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div>
            <h1 style={{ color: 'var(--text-primary)' }} className='font-semibold text-xs'>{user?.username}</h1>
            <span style={{ color: 'var(--text-secondary)' }} className='text-xs'>Bio here...</span>
          </div>
        </div>
        <div>
          <Textarea 
            value={caption} 
            onChange={(e) => {
              if (e.target.value.length <= CAPTION_LIMIT) {
                setCaption(e.target.value);
              }
            }} 
            className="focus-visible:ring-transparent border-none placeholder-opacity-70" 
            placeholder="Write a caption..." 
          />
          <div className='flex justify-between mt-2 text-xs' style={{ color: 'var(--text-secondary)' }}>
            <span>{caption.length}/{CAPTION_LIMIT}</span>
            {caption.length > CAPTION_LIMIT * 0.8 && (
              <span style={{ color: '#ff9500' }}>⚠️ Approaching limit</span>
            )}
          </div>
        </div>
        {
          imagePreview && (
            <div className='w-full h-64 flex items-center justify-center bg-gray-900 rounded-md relative'>
              <img src={imagePreview} alt="preview_img" className='object-cover h-full w-full rounded-md' />
              <button 
                onClick={() => {
                  setImagePreview("");
                  setFile("");
                  imageRef.current.value = "";
                }}
                className='absolute top-2 right-2 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm hover:bg-opacity-80 transition'
              >
                ✕
              </button>
            </div>
          )
        }
        <input 
          ref={imageRef} 
          type='file' 
          className='hidden' 
          onChange={fileChangeHandler}
          accept="image/*"
        />
        {!imagePreview && (
          <Button onClick={() => imageRef.current.click()} className='w-fit mx-auto bg-[#0095F6] hover:bg-[#258bcf]'>
            Select from computer
          </Button>
        )}
        {
          imagePreview && (
            loading ? (
              <Button disabled className="w-full">
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Posting...
              </Button>
            ) : (
              <Button 
                onClick={createPostHandler} 
                type="submit" 
                className="w-full bg-[#0095F6] hover:bg-[#258bcf]"
                disabled={!caption.trim() || loading}
              >
                Post
              </Button>
            )
          )
        }
      </DialogContent>
    </Dialog>
  )
}

export default CreatePost