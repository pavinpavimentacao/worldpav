import React, { ReactNode, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/auth-hooks'
import { 
  LayoutDashboard, 
  Users, 
  Construction, 
  ClipboardList, 
  Calculator, 
  Settings, 
  BarChart3,
  LogOut,
  User
} from 'lucide-react'

interface MobileTabsSidebarProps {
  children: ReactNode
}

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/', 
    icon: LayoutDashboard,
    mobileLabel: 'Home'
  },
  { 
    name: 'Clientes', 
    href: '/clients', 
    icon: Users,
    mobileLabel: 'Clientes'
  },
  { 
    name: 'Obras', 
    href: '/obras', 
    icon: Construction,
    mobileLabel: 'Obras'
  },
  { 
    name: 'Relatórios Diários', 
    href: '/relatorios-diarios', 
    icon: ClipboardList,
    mobileLabel: 'Diários'
  },
  { 
    name: 'Financeiro', 
    href: '/financial', 
    icon: Calculator,
    mobileLabel: 'Financeiro'
  }
]

// Navegação secundária para tabs adicionais
const secondaryNavigation = [
  { 
    name: 'Maquinários', 
    href: '/maquinarios', 
    icon: Settings,
    mobileLabel: 'Maquinários'
  },
  { 
    name: 'Relatórios', 
    href: '/reports', 
    icon: BarChart3,
    mobileLabel: 'Relatórios'
  }
]

// Navegação adicional para menu de usuário
const userNavigation = [
  { 
    name: 'Maquinários', 
    href: '/maquinarios', 
    icon: Settings
  },
  { 
    name: 'Relatórios', 
    href: '/reports', 
    icon: BarChart3
  }
]

export function MobileTabsSidebar({ children }: MobileTabsSidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [activeTabGroup, setActiveTabGroup] = useState<'main' | 'secondary'>('main')

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0]
    }
    if (user?.email) {
      return user.email.split('@')[0].split('.')[0]
    }
    return 'Usuário'
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-80 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white shadow-lg">
          {/* Header */}
          <div className="flex items-center px-6 py-4 border-b border-gray-200">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">WorldPav</h1>
                <p className="text-xs text-gray-500">Sistema de Gestão</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {[...navigation, ...userNavigation].map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 rounded-xl transition-colors ${
                    active
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-4" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{getUserDisplayName()}</div>
                <div className="text-sm text-gray-500">WorldPav</div>
              </div>
            </div>
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-center">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">WorldPav</h1>
              <p className="text-xs text-gray-500">Sistema de Gestão</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-80 pb-20 lg:pb-0">
        <div className="px-4 py-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Tabs */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        {/* Tab Group Selector */}
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTabGroup('main')}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              activeTabGroup === 'main'
                ? 'text-primary-600 bg-primary-50 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Principal
          </button>
          <button
            onClick={() => setActiveTabGroup('secondary')}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              activeTabGroup === 'secondary'
                ? 'text-primary-600 bg-primary-50 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Mais
          </button>
        </div>
        
        {/* Tabs Content */}
        <div className="grid grid-cols-5 h-16">
          {(activeTabGroup === 'main' ? navigation : secondaryNavigation).map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setActiveTabGroup('main')}
                className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                  active
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? 'text-primary-600' : 'text-gray-500'}`} />
                <span className="text-xs font-medium">{item.mobileLabel}</span>
              </Link>
            )
          })}
          
          {/* Logout button in secondary group */}
          {activeTabGroup === 'secondary' && (
            <button
              onClick={() => {
                setActiveTabGroup('main')
                handleSignOut()
              }}
              className="flex flex-col items-center justify-center space-y-1 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-xs font-medium">Sair</span>
            </button>
          )}
        </div>
      </div>

    </div>
  )
}
