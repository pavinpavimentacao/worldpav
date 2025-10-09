import { Home, Calendar, Building2, DollarSign, MoreHorizontal } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import clsx from 'clsx'

interface TabItem {
  id: string
  label: string
  icon: React.ReactNode
  path: string
}

const tabs: TabItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: <Home className="w-6 h-6" />,
    path: '/'
  },
  {
    id: 'programacao',
    label: 'Programação',
    icon: <Calendar className="w-6 h-6" />,
    path: '/programacao-pavimentacao'
  },
  {
    id: 'obras',
    label: 'Obras',
    icon: <Building2 className="w-6 h-6" />,
    path: '/obras'
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    icon: <DollarSign className="w-6 h-6" />,
    path: '/financial'
  },
  {
    id: 'mais',
    label: 'Mais',
    icon: <MoreHorizontal className="w-6 h-6" />,
    path: '/more'
  }
]

export function BottomTabs() {
  const location = useLocation()

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg safe-area-inset-bottom md:hidden" style={{ zIndex: 9999 }}>
      <nav className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const active = isActive(tab.path)
          return (
            <Link
              key={tab.id}
              to={tab.path}
              className={clsx(
                'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                active
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <div className={clsx(
                'transition-transform',
                active && 'scale-110'
              )}>
                {tab.icon}
              </div>
              <span className={clsx(
                'text-xs font-medium',
                active && 'font-semibold'
              )}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

