import React from 'react'
import Feed from './Feed'
import { Outlet } from 'react-router-dom'
import RightSidebar from './RightSidebar'
import useGetAllPost from '@/hooks/useGetAllPost'
import useGetSuggestedUsers from '@/hooks/useGetSuggestedUsers'

const Home = () => {
    useGetAllPost();
    useGetSuggestedUsers();
    return (
        <div style={{
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)'
        }} className='flex w-full transition-colors duration-300'>
            {/* Feed Section */}
            <div className='flex-1'>
                <Feed />
                <Outlet />
            </div>
            {/* Right Sidebar - Suggestions */}
            <RightSidebar />
        </div>
    )
}

export default Home