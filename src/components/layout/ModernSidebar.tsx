import React, { ReactNode, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../lib/auth-hooks'
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
  Home,
  Building,
  User,
  Wrench
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ModernSidebarProps {
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
    name: 'Serviços', 
    href: '/servicos', 
    icon: Wrench,
    color: 'from-purple-500 to-purple-600',
    description: 'Catálogo de serviços'
  },
  { 
    name: 'Relatórios Diários', 
    href: '/relatorios-diarios', 
    icon: ClipboardList,
    color: 'from-purple-500 to-purple-600',
    description: 'Relatórios de obra'
  },
  // TEMPORARIAMENTE DESABILITADO - SERÁ RECRIADO
  // { 
  //   name: 'Financeiro', 
  //   href: '/financial', 
  //   icon: Calculator,
  //   color: 'from-emerald-500 to-emerald-600',
  //   description: 'Controle financeiro'
  // },
  { 
    name: 'Relatórios', 
    href: '/reports', 
    icon: BarChart3,
    color: 'from-indigo-500 to-indigo-600',
    description: 'Análises e relatórios'
  },
]

export function ModernSidebar({ children }: ModernSidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

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
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : '-100%',
          transition: { type: 'spring', damping: 30, stiffness: 300 }
        }}
        className="fixed inset-y-0 left-0 z-40 w-80 bg-white shadow-2xl lg:translate-x-0 lg:static lg:inset-0 lg:z-auto"
      >
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
                <motion.div
                  key={item.name}
                  onHoverStart={() => setHoveredItem(item.name)}
                  onHoverEnd={() => setHoveredItem(null)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`relative flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                      active
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {/* Background gradient for hover */}
                    <div
                      className={`absolute inset-0 rounded-xl bg-gradient-to-r ${item.color} opacity-0 transition-opacity duration-200 ${
                        hoveredItem === item.name && !active ? 'opacity-10' : ''
                      }`}
                    />
                    
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
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute right-4 w-2 h-2 bg-white rounded-full"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                    
                    {/* Hover arrow */}
                    {hoveredItem === item.name && !active && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="absolute right-4"
                      >
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </motion.div>
                    )}
                  </Link>
                </motion.div>
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
      </motion.div>

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