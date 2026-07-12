import { Home, LogOut, MessageCircle, PlusSquare, Search, Moon, Sun, X } from 'lucide-react'
import React, { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { toast } from 'sonner'
import API from '@/lib/axios'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setAuthUser } from '@/redux/authSlice'
import CreatePost from './CreatePost'
import { setPosts, setSelectedPost } from '@/redux/postSlice'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Button } from './ui/button'
import { useTheme } from '@/context/ThemeContext'
import { Input } from './ui/input'
import useSearchUsers from '@/hooks/useSearchUsers'

const LeftSidebar = () => {
    const navigate = useNavigate();
    const { user } = useSelector(store => store.auth);
    const chatState = useSelector(store => store.chat);
    const unreadMessages = chatState?.unreadMessages || {};
    const dispatch = useDispatch();
    const [open, setOpen] = useState(false);
    const { searchResults, isSearching, searchQuery, searchUsers, clearSearch } = useSearchUsers();
    const [searchInput, setSearchInput] = useState("");
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Calculate total unread messages safely
    const totalUnreadMessages = Object.keys(unreadMessages).length > 0 
        ? Object.values(unreadMessages).reduce((sum, count) => sum + (count || 0), 0)
        : 0;


    const logoutHandler = async () => {
        try {
            const res = await API.get('/user/logout');
            if (res.data.success) {
                dispatch(setAuthUser(null));
                dispatch(setSelectedPost(null));
                dispatch(setPosts([]));
                navigate("/login");
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Logout failed");
        }
    }

    const sidebarHandler = (textType) => {
        if (textType === 'Logout') {
            logoutHandler();
        } else if (textType === "Create") {
            setOpen(true);
        } else if (textType === "Profile") {
            navigate(`/profile/${user?._id}`);
        } else if (textType === "Home") {
            navigate("/");
        } else if (textType === 'Messages') {
            navigate("/chat");
        } else if (textType === 'Search') {
            setIsSearchOpen(true);
        }
    }

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchInput(value);
        
        if (value.trim().length > 0) {
            searchUsers(value);
            setShowSearchResults(true);
        } else {
            clearSearch();
            setShowSearchResults(false);
        }
    };

    const handleSearchSelect = (selectedUser) => {
        navigate(`/profile/${selectedUser._id}`);
        setSearchInput("");
        clearSearch();
        setShowSearchResults(false);
        setIsSearchOpen(false);
    };

    const closeSearch = () => {
        setIsSearchOpen(false);
        setSearchInput("");
        clearSearch();
        setShowSearchResults(false);
    };

    const sidebarItems = [
        { icon: <Home size={24} />, text: "Home" },
        { icon: <Search size={24} />, text: "Search" },
        { icon: <MessageCircle size={24} />, text: "Messages" },
        { icon: <PlusSquare size={24} />, text: "Create" },
        {
            icon: (
                <Avatar className='w-7 h-7'>
                    <AvatarImage src={user?.profilePicture} alt="profile" />
                    <AvatarFallback className='bg-gradient-to-br from-pink-500 to-orange-400 text-white text-xs font-bold'>
                        {user?.username?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                </Avatar>
            ),
            text: "Profile"
        },
    ]

    const { isDark, toggleTheme } = useTheme();

    return (
        <div style={{ 
            backgroundColor: 'var(--sidebar-bg)',
            borderColor: 'var(--sidebar-border)',
            color: 'var(--text-primary)'
        }} className='fixed left-0 top-0 h-screen w-64 border-r flex flex-col z-50 transition-colors duration-300'>
            {/* Logo */}
            <div style={{ 
                borderColor: 'var(--sidebar-border)'
            }} className='p-6 border-b'>
                <h1 className='text-2xl font-bold bg-gradient-to-r from-pink-500 to-orange-400 bg-clip-text text-transparent'>
                    Synapse
                </h1>
            </div>

            {/* Navigation Items */}
            <div className='flex-1 overflow-y-auto py-4'>
                {
                    sidebarItems.map((item, index) => {
                        return (
                            <div 
                                onClick={() => sidebarHandler(item.text)} 
                                key={index} 
                                style={{ 
                                    color: 'var(--text-primary)',
                                    '&:hover': { backgroundColor: 'var(--hover-bg)' }
                                }}
                                className='flex items-center gap-4 px-6 py-3 hover:opacity-80 cursor-pointer transition duration-200 relative group'
                            >
                                <div style={{ color: 'var(--text-primary)', position: 'relative' }}>
                                    {item.icon}
                                    {/* Red Dot for Unread Messages */}
                                    {item.text === "Messages" && totalUnreadMessages > 0 && (
                                        <div className='absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full' style={{
                                            boxShadow: '0 0 10px rgba(239, 68, 68, 0.8)'
                                        }}></div>
                                    )}
                                </div>
                                <span className='text-lg font-medium'>{item.text}</span>
                                
                                {/* Messages Unread Badge */}
                                {
                                    item.text === "Messages" && totalUnreadMessages > 0 && (
                                        <span className="ml-auto bg-red-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                                            {totalUnreadMessages > 99 ? '99+' : totalUnreadMessages}
                                        </span>
                                    )
                                }
                            </div>
                        )
                    })
                }
            </div>

            {/* Bottom Section - Theme & Logout */}
            <div style={{ 
                borderColor: 'var(--sidebar-border)'
            }} className='p-6 border-t flex flex-col gap-4'>
                {/* Theme Toggle */}
                <Button 
                    onClick={toggleTheme}
                    variant="ghost"
                    className='w-full flex items-center gap-4 justify-start transition-all'
                    style={{
                        backgroundColor: 'var(--input-bg)',
                        color: 'var(--text-primary)',
                        borderColor: 'var(--border-color)'
                    }}
                >
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    <span className='text-lg font-medium'>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </Button>

                {/* Logout Button */}
                <Button 
                    onClick={logoutHandler}
                    variant="ghost"
                    className='w-full flex items-center gap-4 text-red-500 hover:text-red-400 justify-start'
                    style={{
                        backgroundColor: 'transparent'
                    }}
                >
                    <LogOut size={24} />
                    <span className='text-lg font-medium'>Logout</span>
                </Button>
            </div>

            {/* Create Post Modal */}
            <CreatePost open={open} setOpen={setOpen} />

            {/* Search Modal - Opens when Search icon is clicked */}
            {isSearchOpen && (
                <div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center' onClick={closeSearch}>
                    <div 
                        className='bg-gray-900 rounded-lg w-96 max-h-96 flex flex-col border border-gray-700'
                        style={{ 
                            backgroundColor: 'var(--sidebar-bg)',
                            borderColor: 'var(--border-color)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Search Header */}
                        <div className='p-4 border-b flex items-center justify-between' style={{ borderColor: 'var(--border-color)' }}>
                            <h2 className='text-lg font-semibold' style={{ color: 'var(--text-primary)' }}>Search</h2>
                            <button 
                                onClick={closeSearch}
                                className='hover:opacity-70 transition'
                            >
                                <X size={20} style={{ color: 'var(--text-primary)' }} />
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className='p-4 border-b' style={{ borderColor: 'var(--border-color)' }}>
                            <div className='flex items-center relative'>
                                <Search size={18} style={{ 
                                    position: 'absolute', 
                                    left: '12px', 
                                    color: 'var(--text-secondary)',
                                    pointerEvents: 'none'
                                }} />
                                <Input 
                                    type="text" 
                                    placeholder="Search users..." 
                                    value={searchInput}
                                    onChange={handleSearchChange}
                                    autoFocus
                                    className='w-full pl-10 focus-visible:ring-transparent'
                                    style={{ 
                                        backgroundColor: 'var(--input-bg)', 
                                        color: 'var(--text-primary)',
                                        borderColor: 'var(--border-color)'
                                    }}
                                />
                                {searchInput && (
                                    <button 
                                        onClick={() => {
                                            setSearchInput("");
                                            clearSearch();
                                            setShowSearchResults(false);
                                        }}
                                        className='absolute right-3'
                                    >
                                        <X size={18} style={{ color: 'var(--text-secondary)' }} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Search Results */}
                        <div className='flex-1 overflow-y-auto'>
                            {searchInput.trim().length === 0 ? (
                                <p className='p-4 text-center text-sm' style={{ color: 'var(--text-secondary)' }}>
                                    Start typing to search for users
                                </p>
                            ) : isSearching ? (
                                <p className='p-4 text-center text-sm' style={{ color: 'var(--text-secondary)' }}>
                                    Searching...
                                </p>
                            ) : searchResults.length > 0 ? (
                                searchResults.map((result) => (
                                    <div 
                                        key={result._id}
                                        onClick={() => handleSearchSelect(result)}
                                        className='flex items-center gap-3 p-4 hover:opacity-80 cursor-pointer transition-colors border-b last:border-b-0'
                                        style={{ borderColor: 'var(--border-color)' }}
                                    >
                                        <Avatar className='w-10 h-10'>
                                            <AvatarImage src={result.profilePicture} />
                                            <AvatarFallback>{result.username?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className='flex-1 min-w-0'>
                                            <p className='text-sm font-semibold truncate' style={{ color: 'var(--text-primary)' }}>
                                                {result.username}
                                            </p>
                                            <p className='text-xs truncate' style={{ color: 'var(--text-secondary)' }}>
                                                {result.bio || 'No bio'}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className='p-4 text-center text-sm' style={{ color: 'var(--text-secondary)' }}>
                                    No users found
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default LeftSidebar