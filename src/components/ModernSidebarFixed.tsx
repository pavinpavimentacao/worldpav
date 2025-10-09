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
  Menu,
  X,
  ChevronRight,
  User
} from 'lucide-react'

interface ModernSidebarFixedProps {
  children: ReactNode
}

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/', 
    icon: LayoutDashboard,
    color: 'from-blue-500 to-blue-600',
    description: 'Visão geral do sistema'
  },
  { 
    name: 'Clientes', 
    href: '/clients', 
    icon: Users,
    color: 'from-green-500 to-green-600',
    description: 'Gestão de clientes'
  },
  { 
    name: 'Obras', 
    href: '/obras', 
    icon: Construction,
    color: 'from-orange-500 to-orange-600',
    description: 'Projetos de pavimentação'
  },
  { 
    name: 'Relatórios Diários', 
    href: '/relatorios-diarios', 
    icon: ClipboardList,
    color: 'from-purple-500 to-purple-600',
    description: 'Relatórios de obra'
  },
  { 
    name: 'Financeiro', 
    href: '/financial', 
    icon: Calculator,
    color: 'from-emerald-500 to-emerald-600',
    description: 'Controle financeiro'
  },
  { 
    name: 'Relatórios', 
    href: '/reports', 
    icon: BarChart3,
    color: 'from-indigo-500 to-indigo-600',
    description: 'Análises e relatórios'
  },
]

export function ModernSidebarFixed({ children }: ModernSidebarFixedProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-white p-2 rounded-lg shadow-lg border border-gray-200"
        >
          {sidebarOpen ? (
            <X className="h-6 w-6 text-gray-700" />
          ) : (
            <Menu className="h-6 w-6 text-gray-700" />
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <Link to="/" className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">W</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-secondary-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">WorldPav</h1>
                <p className="text-xs text-gray-500">Sistema de Gestão</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`relative flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                    active
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {/* Icon */}
                  <div className={`relative z-10 mr-4 ${
                    active ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  {/* Text */}
                  <div className="relative z-10 flex-1">
                    <div className={`font-medium ${active ? 'text-white' : 'text-gray-900'}`}>
                      {item.name}
                    </div>
                    <div className={`text-xs ${active ? 'text-primary-100' : 'text-gray-500'}`}>
                      {item.description}
                    </div>
                  </div>
                  
                  {/* Active indicator */}
                  {active && (
                    <div className="absolute right-4 w-2 h-2 bg-white rounded-full" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{getUserDisplayName()}</div>
                <div className="text-sm text-gray-500">WorldPav</div>
              </div>
            </div>
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors duration-200"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-80">
        <div className="px-4 py-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

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
  Menu,
  X,
  ChevronRight,
  User
} from 'lucide-react'

interface ModernSidebarFixedProps {
  children: ReactNode
}

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/', 
    icon: LayoutDashboard,
    color: 'from-blue-500 to-blue-600',
    description: 'Visão geral do sistema'
  },
  { 
    name: 'Clientes', 
    href: '/clients', 
    icon: Users,
    color: 'from-green-500 to-green-600',
    description: 'Gestão de clientes'
  },
  { 
    name: 'Obras', 
    href: '/obras', 
    icon: Construction,
    color: 'from-orange-500 to-orange-600',
    description: 'Projetos de pavimentação'
  },
  { 
    name: 'Relatórios Diários', 
    href: '/relatorios-diarios', 
    icon: ClipboardList,
    color: 'from-purple-500 to-purple-600',
    description: 'Relatórios de obra'
  },
  { 
    name: 'Financeiro', 
    href: '/financial', 
    icon: Calculator,
    color: 'from-emerald-500 to-emerald-600',
    description: 'Controle financeiro'
  },
  { 
    name: 'Relatórios', 
    href: '/reports', 
    icon: BarChart3,
    color: 'from-indigo-500 to-indigo-600',
    description: 'Análises e relatórios'
  },
]

export function ModernSidebarFixed({ children }: ModernSidebarFixedProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-white p-2 rounded-lg shadow-lg border border-gray-200"
        >
          {sidebarOpen ? (
            <X className="h-6 w-6 text-gray-700" />
          ) : (
            <Menu className="h-6 w-6 text-gray-700" />
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <Link to="/" className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">W</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-secondary-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">WorldPav</h1>
                <p className="text-xs text-gray-500">Sistema de Gestão</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`relative flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                    active
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {/* Icon */}
                  <div className={`relative z-10 mr-4 ${
                    active ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  {/* Text */}
                  <div className="relative z-10 flex-1">
                    <div className={`font-medium ${active ? 'text-white' : 'text-gray-900'}`}>
                      {item.name}
                    </div>
                    <div className={`text-xs ${active ? 'text-primary-100' : 'text-gray-500'}`}>
                      {item.description}
                    </div>
                  </div>
                  
                  {/* Active indicator */}
                  {active && (
                    <div className="absolute right-4 w-2 h-2 bg-white rounded-full" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{getUserDisplayName()}</div>
                <div className="text-sm text-gray-500">WorldPav</div>
              </div>
            </div>
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors duration-200"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-80">
        <div className="px-4 py-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
