import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Dialog, DialogContent, DialogHeader } from './ui/dialog'
import useGetUserProfile from '@/hooks/useGetUserProfile';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AtSign, Heart, MessageCircle, Edit2 } from 'lucide-react';
import API from '@/lib/axios'
import { toast } from 'sonner'
import { setAuthUser, setSelectedUser } from '@/redux/authSlice'

const Profile = () => {
  const params = useParams();
  const userId = params.id;
  const navigate = useNavigate();
  useGetUserProfile(userId);
  const [activeTab, setActiveTab] = useState('posts');
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const dispatch = useDispatch();

  const { userProfile, user } = useSelector(store => store.auth);

  const isLoggedInUserProfile = user?._id === userProfile?._id;
  const isFollowing = user?.following?.includes(userProfile?._id) || false;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  }

  const handleFollowUnfollow = async () => {
    try {
      const res = await API.post(`/user/followorunfollow/${userProfile?._id}`);
      if (res.data.success) {
        // Update the current user's following list
        const updatedUser = {
          ...user,
          following: isFollowing 
            ? user.following.filter(id => id !== userProfile._id)
            : [...(user.following || []), userProfile._id]
        };
        dispatch(setAuthUser(updatedUser));
        
        // Also update the userProfile's followers
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to follow/unfollow');
      console.log(error);
    }
  }

  const handleMessage = () => {
    dispatch(setSelectedUser(userProfile));
    navigate('/chat');
  }

  const fetchFollowers = async () => {
    try {
      const res = await API.get(`/user/${userProfile?._id}/followers`);
      if (res.data.success) {
        setFollowers(res.data.followers || []);
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to fetch followers');
    }
  }

  const fetchFollowing = async () => {
    try {
      const res = await API.get(`/user/${userProfile?._id}/following`);
      if (res.data.success) {
        setFollowing(res.data.following || []);
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to fetch following');
    }
  }

  const handleShowFollowers = () => {
    fetchFollowers();
    setShowFollowersModal(true);
  }

  const handleShowFollowing = () => {
    fetchFollowing();
    setShowFollowingModal(true);
  }


  const displayedPost = activeTab === 'posts' ? userProfile?.posts : userProfile?.bookmarks;

  return (
    <div style={{
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)'
    }} className='flex max-w-5xl justify-center mx-auto pl-10 transition-colors duration-300'>
      <div className='flex flex-col gap-20 p-8'>
        <div className='grid grid-cols-2'>
          <section className='flex items-center justify-center relative w-32'>
            <Avatar className='h-32 w-32'>
              <AvatarImage src={userProfile?.profilePicture} alt="profilephoto" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            {isLoggedInUserProfile && (
              <Link to="/account/edit" className='absolute bottom-1 right-1 bg-gray-700 hover:bg-gray-600 rounded-full p-2.5 cursor-pointer transition border-2 border-gray-800'>
                <Edit2 size={18} style={{ color: 'var(--text-primary)' }} />
              </Link>
            )}
          </section>
          <section>
            <div className='flex flex-col gap-5'>
              <div className='flex items-center gap-2'>
                <span style={{ color: 'var(--text-primary)' }} className='text-lg font-semibold'>{userProfile?.username}</span>
                {
                  !isLoggedInUserProfile && (
                    isFollowing ? (
                      <>
                        <Button onClick={handleFollowUnfollow} variant='secondary' className='h-8'>Unfollow</Button>
                        <Button onClick={handleMessage} variant='secondary' className='h-8'>Message</Button>
                      </>
                    ) : (
                      <Button onClick={handleFollowUnfollow} className='bg-[#0095F6] hover:bg-[#3192d2] h-8'>Follow</Button>
                    )
                  )
                }
              </div>
              <div className='flex items-center gap-4'>
                <p style={{ color: 'var(--text-primary)' }}><span className='font-semibold'>{userProfile?.posts.length} </span>posts</p>
                <p 
                  style={{ color: 'var(--text-primary)' }}
                  className='cursor-pointer hover:opacity-70'
                  onClick={handleShowFollowers}
                >
                  <span className='font-semibold'>{userProfile?.followers.length} </span>followers
                </p>
                <p 
                  style={{ color: 'var(--text-primary)' }}
                  className='cursor-pointer hover:opacity-70'
                  onClick={handleShowFollowing}
                >
                  <span className='font-semibold'>{userProfile?.following.length} </span>following
                </p>
              </div>
              <div className='flex flex-col gap-1'>
                <span style={{ color: 'var(--text-primary)' }} className='font-semibold'>{userProfile?.bio || 'bio here...'}</span>
                <Badge className='w-fit' variant='secondary'><AtSign /> <span className='pl-1' style={{ color: 'var(--text-primary)' }}>{userProfile?.username}</span> </Badge>
              </div>
            </div>
          </section>
        </div>
        <div style={{ borderColor: 'var(--border-color)' }} className='border-t'>
          <div className='flex items-center justify-center gap-10 text-sm'>
            <span style={{
              color: activeTab === 'posts' ? 'var(--text-primary)' : 'var(--text-secondary)',
              borderColor: activeTab === 'posts' ? 'var(--text-primary)' : 'transparent'
            }} className={`py-3 cursor-pointer border-b-2 transition`} onClick={() => handleTabChange('posts')}>
              POSTS
            </span>
          </div>
          <div className='grid grid-cols-3 gap-1'>
            {
              displayedPost?.map((post) => {
                return (
                  <div key={post?._id} className='relative group cursor-pointer'>
                    <img src={post.image} alt='postimage' className='rounded-sm w-full aspect-square object-cover hover:opacity-80 transition' />
                    <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                      <div className='flex items-center text-white space-x-4'>
                        <button className='flex items-center gap-2 hover:text-gray-300'>
                          <Heart />
                          <span>{post?.likes.length}</span>
                        </button>
                        <button className='flex items-center gap-2 hover:text-gray-300'>
                          <MessageCircle />
                          <span>{post?.comments.length}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>

      {/* Followers Modal */}
      <Dialog open={showFollowersModal} onOpenChange={setShowFollowersModal}>
        <DialogContent style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
          color: 'var(--text-primary)'
        }} className="border max-w-md">
          <DialogHeader className='font-semibold text-center'>
            Followers
          </DialogHeader>
          <div className='max-h-96 overflow-y-auto'>
            {followers.length > 0 ? (
              followers.map((follower) => (
                <div 
                  key={follower._id}
                  className='flex items-center justify-between p-3 hover:bg-gray-900 rounded-md transition'
                >
                  <Link to={`/profile/${follower._id}`} className='flex items-center gap-3 flex-1'>
                    <Avatar className='w-10 h-10'>
                      <AvatarImage src={follower.profilePicture} />
                      <AvatarFallback>{follower.username?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className='font-semibold text-sm'>{follower.username}</p>
                      <p style={{ color: 'var(--text-secondary)' }} className='text-xs'>{follower.bio || 'No bio'}</p>
                    </div>
                  </Link>
                  {user?._id !== follower._id && (
                    <Button size='sm' variant='outline' className='text-xs'>
                      {user?.following?.includes(follower._id) ? 'Following' : 'Follow'}
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-secondary)' }} className='text-center py-8'>
                No followers yet
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Following Modal */}
      <Dialog open={showFollowingModal} onOpenChange={setShowFollowingModal}>
        <DialogContent style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
          color: 'var(--text-primary)'
        }} className="border max-w-md">
          <DialogHeader className='font-semibold text-center'>
            Following
          </DialogHeader>
          <div className='max-h-96 overflow-y-auto'>
            {following.length > 0 ? (
              following.map((followingUser) => (
                <div 
                  key={followingUser._id}
                  className='flex items-center justify-between p-3 hover:bg-gray-900 rounded-md transition'
                >
                  <Link to={`/profile/${followingUser._id}`} className='flex items-center gap-3 flex-1'>
                    <Avatar className='w-10 h-10'>
                      <AvatarImage src={followingUser.profilePicture} />
                      <AvatarFallback>{followingUser.username?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className='font-semibold text-sm'>{followingUser.username}</p>
                      <p style={{ color: 'var(--text-secondary)' }} className='text-xs'>{followingUser.bio || 'No bio'}</p>
                    </div>
                  </Link>
                  {user?._id !== followingUser._id && (
                    <Button size='sm' variant='outline' className='text-xs'>
                      {user?.following?.includes(followingUser._id) ? 'Following' : 'Follow'}
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-secondary)' }} className='text-center py-8'>
                Not following anyone
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Profile