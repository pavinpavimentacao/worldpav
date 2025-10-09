import React, { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { WorldPavModernSidebar } from './ui/worldpav-modern-sidebar'
import { BottomTabs } from './mobile/BottomTabs'
import { useMediaQuery } from '../hooks/use-media-query'
import clsx from 'clsx'

interface LayoutProps {
  children: ReactNode
  hideBottomNav?: boolean
}

export function Layout({ children, hideBottomNav = false }: LayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useMediaQuery('(max-width: 768px)')

  const handleNavigate = (href: string) => {
    navigate(href)
  }

  return (
    <div className="flex h-screen w-screen bg-gray-50">
      {/* Sidebar - apenas desktop */}
      {!isMobile && <WorldPavModernSidebar onNavigate={handleNavigate} />}
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        <div className={clsx(
          'min-h-full',
          isMobile && !hideBottomNav && 'pb-16'
        )}>
          {children}
        </div>
      </div>

      {/* Bottom Tabs - apenas mobile */}
      {isMobile && !hideBottomNav && <BottomTabs />}
    </div>
  )
}
