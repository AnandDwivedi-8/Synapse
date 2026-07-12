import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

const SuggestedUsers = () => {
    const { suggestedUsers } = useSelector(store => store.auth);
    
    // Return empty div if suggestedUsers is null, undefined, or empty
    if (!suggestedUsers || !Array.isArray(suggestedUsers) || suggestedUsers.length === 0) {
        return <div className='space-y-4'></div>;
    }
    
    // Filter out null/undefined entries and return early if none left
    const validUsers = suggestedUsers.filter(user => user && user._id);
    
    if (validUsers.length === 0) {
        return <div className='space-y-4'></div>;
    }
    
    return (
        <div className='space-y-4'>
            {
                validUsers.map((user) => {
                    return (
                        <div key={user._id} style={{
                            backgroundColor: 'var(--hover-bg)',
                            color: 'var(--text-primary)'
                        }} className='flex items-center justify-between py-3 px-2 rounded-lg hover:opacity-80 transition'>
                            <div className='flex items-center gap-3 flex-1'>
                                <Link to={`/profile/${user?._id}`}>
                                    <Avatar className='w-10 h-10'>
                                        <AvatarImage src={user?.profilePicture} alt={user?.username} />
                                        <AvatarFallback className='bg-gradient-to-br from-pink-500 to-orange-400 text-white text-xs font-bold'>
                                            {user?.username?.charAt(0)?.toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </Link>
                                <div className='flex-1 min-w-0'>
                                    <h1 style={{ color: 'var(--text-primary)' }} className='font-semibold text-sm hover:opacity-70 cursor-pointer truncate'>
                                        <Link to={`/profile/${user?._id}`} style={{ color: 'var(--text-primary)' }}>{user?.username}</Link>
                                    </h1>
                                    <span style={{ color: 'var(--text-secondary)' }} className='text-xs truncate block'>{user?.bio || 'Suggested for you'}</span>
                                </div>
                            </div>
                        </div>
                    )
                })
            }
        </div>
    )
}

export default SuggestedUsers