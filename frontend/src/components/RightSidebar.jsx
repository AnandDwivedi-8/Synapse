import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom';
import SuggestedUsers from './SuggestedUsers';

const RightSidebar = () => {
  const { user } = useSelector(store => store.auth);
  return (
    <div style={{
      backgroundColor: 'var(--bg-primary)',
      borderColor: 'var(--border-color)',
      color: 'var(--text-primary)'
    }} className='hidden lg:block w-80 h-screen border-l overflow-y-auto p-6 fixed right-0 transition-colors duration-300'>
      {/* User Profile Section */}
      <div className='mb-8'>
        <div className='flex items-center gap-3 mb-6'>
          <Link to={`/profile/${user?._id}`}>
            <Avatar className='w-12 h-12'>
              <AvatarImage src={user?.profilePicture} alt="profile" />
              <AvatarFallback className='bg-gradient-to-br from-pink-500 to-orange-400'>{user?.username?.charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>
          <div className='flex-1'>
            <h1 className='font-semibold text-sm hover:opacity-70 transition cursor-pointer'>
              <Link to={`/profile/${user?._id}`} style={{ color: 'var(--text-primary)' }}>{user?.username}</Link>
            </h1>
            <span style={{ color: 'var(--text-secondary)' }} className='text-xs'>{user?.bio || 'Add a bio...'}</span>
          </div>
        </div>

        {/* Profile Stats */}
        <div style={{
          borderColor: 'var(--border-color)'
        }} className='grid grid-cols-3 gap-4 text-center py-4 border-y'>
          <div className='hover:opacity-70 transition cursor-pointer'>
            <div style={{ color: 'var(--text-primary)' }} className='font-bold'>{user?.posts?.length || 0}</div>
            <div className='text-xs' style={{ color: 'var(--text-secondary)' }}>Posts</div>
          </div>
          <div className='hover:opacity-70 transition cursor-pointer'>
            <div style={{ color: 'var(--text-primary)' }} className='font-bold'>{user?.followers?.length || 0}</div>
            <div className='text-xs' style={{ color: 'var(--text-secondary)' }}>Followers</div>
          </div>
          <div className='hover:opacity-70 transition cursor-pointer'>
            <div style={{ color: 'var(--text-primary)' }} className='font-bold'>{user?.following?.length || 0}</div>
            <div className='text-xs' style={{ color: 'var(--text-secondary)' }}>Following</div>
          </div>
        </div>
      </div>

      {/* Suggestions Section */}
      <div>
        <div className='flex justify-between items-center mb-4'>
          <h2 style={{ color: 'var(--text-primary)' }} className='font-bold text-sm'>Suggestions For You</h2>
          <Link to="#" style={{ color: 'var(--text-secondary)' }} className='text-xs font-semibold hover:opacity-70'>See All</Link>
        </div>
        <SuggestedUsers />
      </div>
    </div>
  )
}

export default RightSidebar