import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { X, Plus } from 'lucide-react'
import { useSelector } from 'react-redux'

const Stories = () => {
    const [selectedStory, setSelectedStory] = useState(null);
    const [storyIndex, setStoryIndex] = useState(0);
    const { suggestedUsers } = useSelector(store => store.auth);
    const { user } = useSelector(store => store.auth);

    // Filter out current user from stories and remove null values
    const storyUsers = suggestedUsers && suggestedUsers
        .filter(u => u && u._id) // Remove null/undefined entries first
        .filter(u => u._id !== user?._id); // Then filter out current user

    const openStory = (userIndex) => {
        setSelectedStory(userIndex);
        setStoryIndex(0);
    };

    const closeStory = () => {
        setSelectedStory(null);
    };

    const nextStory = () => {
        if (selectedStory !== null && selectedStory < storyUsers.length - 1) {
            setSelectedStory(selectedStory + 1);
            setStoryIndex(0);
        } else {
            closeStory();
        }
    };

    const previousStory = () => {
        if (selectedStory !== null && selectedStory > 0) {
            setSelectedStory(selectedStory - 1);
            setStoryIndex(0);
        }
    };

    return (
        <>
            {/* Stories Section */}
            <div className='mt-6 mb-8'>
                <div className='flex overflow-x-auto gap-4 pb-4 scrollbar-hide scroll-smooth px-1'>
                    {/* Your Story Button - Circular with + overlay */}
                    <div className='flex-shrink-0 relative group cursor-pointer'>
                        <div 
                            className='w-20 h-20 rounded-full border-2 flex items-center justify-center transition-all group-hover:opacity-80'
                            style={{
                                backgroundColor: 'var(--card-bg)',
                                borderColor: 'var(--border-color)'
                            }}
                        >
                            <Avatar className='w-16 h-16'>
                                <AvatarImage src={user?.profilePicture} alt="Your story" />
                                <AvatarFallback>{user?.username?.charAt(0)?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                        </div>
                        {/* Small + button on bottom right */}
                        <div 
                            className='absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center border-2 transform translate-x-1 translate-y-1'
                            style={{
                                backgroundColor: '#0095f6',
                                borderColor: 'var(--bg-primary)',
                                color: 'white'
                            }}
                        >
                            <Plus size={14} strokeWidth={3} />
                        </div>
                    </div>
                    
                    {/* Story Items from Users - Circular only */}
                    {storyUsers && storyUsers.length > 0 ? (
                        storyUsers.map((storyUser, index) => (
                            <div 
                                key={storyUser._id}
                                onClick={() => openStory(index)}
                                className='flex-shrink-0 relative group cursor-pointer'
                            >
                                {/* Story Avatar with Gradient Ring */}
                                <div 
                                    className='w-20 h-20 rounded-full p-1 transition-all group-hover:opacity-80'
                                    style={{
                                        background: 'linear-gradient(135deg, #feda75 0%, #fa7e1e 25%, #d92e7f 50%, #9b36b7 75%, #515bd4 100%)'
                                    }}
                                >
                                    <Avatar className='w-full h-full'>
                                        <AvatarImage src={storyUser?.profilePicture} alt={storyUser?.username} />
                                        <AvatarFallback>{storyUser?.username?.charAt(0)?.toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                </div>
                            </div>
                        ))
                    ) : null}
                </div>
            </div>

            {/* Story Viewer Modal */}
            {selectedStory !== null && storyUsers[selectedStory] && (
                <div className='fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center' onClick={closeStory}>
                    <div className='relative w-full max-w-sm' onClick={(e) => e.stopPropagation()}>
                        {/* Story Progress Bars */}
                        <div className='flex gap-1 px-4 py-3'>
                            {storyUsers.map((_, idx) => (
                                <div 
                                    key={idx}
                                    className='h-0.5 flex-1 rounded-full transition-all'
                                    style={{
                                        backgroundColor: idx <= selectedStory ? '#0095f6' : 'rgba(255, 255, 255, 0.3)'
                                    }}
                                />
                            ))}
                        </div>

                        {/* Story Header */}
                        <div className='flex items-center justify-between px-4 py-2 text-white'>
                            <div className='flex items-center gap-3'>
                                <Avatar className='w-8 h-8'>
                                    <AvatarImage src={storyUsers[selectedStory]?.profilePicture} />
                                    <AvatarFallback>{storyUsers[selectedStory]?.username?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className='text-sm font-semibold'>{storyUsers[selectedStory]?.username}</div>
                            </div>
                            <button onClick={closeStory} className='hover:opacity-70 transition'>
                                <X size={24} />
                            </button>
                        </div>

                        {/* Story Image/Content */}
                        <div className='relative bg-gradient-to-br from-yellow-400 via-red-500 to-pink-600 aspect-[9/16] flex items-center justify-center'>
                            {/* Background Image or Gradient */}
                            <img 
                                src={storyUsers[selectedStory]?.profilePicture}
                                alt={storyUsers[selectedStory]?.username}
                                className='absolute inset-0 w-full h-full object-cover opacity-40'
                            />
                            
                            {/* Story Content Overlay */}
                            <div className='relative z-10 text-center'>
                                <Avatar className='w-24 h-24 mx-auto mb-4'>
                                    <AvatarImage src={storyUsers[selectedStory]?.profilePicture} />
                                    <AvatarFallback className='text-4xl'>
                                        {storyUsers[selectedStory]?.username?.charAt(0)?.toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <p className='text-white text-lg font-semibold'>
                                    {storyUsers[selectedStory]?.username}'s Story
                                </p>
                            </div>
                        </div>

                        {/* Navigation Controls */}
                        {/* Previous Button */}
                        <button 
                            onClick={previousStory}
                            className='absolute left-4 top-1/2 -translate-y-1/2 text-white hover:opacity-70 transition disabled:opacity-30'
                            disabled={selectedStory === 0}
                        >
                            <div className='text-3xl'>‹</div>
                        </button>

                        {/* Next Button */}
                        <button 
                            onClick={nextStory}
                            className='absolute right-4 top-1/2 -translate-y-1/2 text-white hover:opacity-70 transition disabled:opacity-30'
                            disabled={selectedStory === storyUsers.length - 1}
                        >
                            <div className='text-3xl'>›</div>
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}

export default Stories
