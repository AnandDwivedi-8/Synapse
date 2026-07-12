import React from 'react'
import Posts from './Posts'
import Stories from './Stories'

const Feed = () => {
  return (
    <div style={{
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)'
    }} className='flex justify-center w-full min-h-screen transition-colors duration-300'>
      <div className='w-full max-w-2xl px-4'>
        {/* Stories Section */}
        <Stories />

        {/* Posts Section */}
        <Posts />
      </div>
    </div>
  )
}

export default Feed