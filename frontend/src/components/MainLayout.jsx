import React from 'react'
import { Outlet } from 'react-router-dom'
import LeftSidebar from './LeftSidebar'
import { useTheme } from '../context/ThemeContext'

const MainLayout = () => {
  const { isDark } = useTheme();
  
  return (
    <div style={{ 
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)'
    }} className='flex h-screen transition-colors duration-300'>
      {/* Left Sidebar */}
      <LeftSidebar />
      
      {/* Main Content */}
      <div className='flex-1 overflow-auto'>
        <Outlet />
      </div>
    </div>
  )
}

export default MainLayout