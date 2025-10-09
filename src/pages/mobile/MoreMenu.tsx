import { 
  Users, 
  Truck, 
  FileText, 
  Receipt, 
  UserPlus, 
  Settings, 
  LogOut, 
  ChevronRight 
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { useAuth } from '../../lib/auth'

interface MenuItem {
  id: string
  label: string
  icon: React.ReactNode
  path: string
  description?: string
}

const menuItems: MenuItem[] = [
  {
    id: 'clients',
    label: 'Clientes',
    icon: <Users className="w-5 h-5" />,
    path: '/clients',
    description: 'Gerenciar clientes'
  },
  {
    id: 'maquinarios',
    label: 'Maquinários',
    icon: <Truck className="w-5 h-5" />,
    path: '/maquinarios',
    description: 'Equipamentos de pavimentação'
  },
  {
    id: 'relatorios',
    label: 'Relatórios Diários',
    icon: <FileText className="w-5 h-5" />,
    path: '/relatorios-diarios',
    description: 'Relatórios de execução'
  },
  {
    id: 'pagamentos',
    label: 'Pagamentos',
    icon: <Receipt className="w-5 h-5" />,
    path: '/pagamentos-receber',
    description: 'Contas a receber'
  },
  {
    id: 'colaboradores',
    label: 'Colaboradores',
    icon: <UserPlus className="w-5 h-5" />,
    path: '/colaboradores',
    description: 'Equipe de trabalho'
  },
  {
    id: 'parceiros',
    label: 'Parceiros',
    icon: <Users className="w-5 h-5" />,
    path: '/parceiros',
    description: 'Empresas parceiras'
  }
]

export default function MoreMenu() {
  const { signOut, user } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  return (
    <Layout hideBottomNav>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-primary-600 text-white p-6 mb-6">
          <h1 className="text-2xl font-bold mb-1">Menu</h1>
          <p className="text-sm opacity-90">
            {user?.email || 'Usuário'}
          </p>
        </div>

        {/* Menu Items */}
        <div className="px-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{item.label}</p>
                    {item.description && (
                      <p className="text-sm text-gray-500">{item.description}</p>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Link>
          ))}

          {/* Configurações */}
          <Link
            to="/settings"
            className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Configurações</p>
                  <p className="text-sm text-gray-500">Preferências do sistema</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Link>

          {/* Sair */}
          <button
            onClick={handleSignOut}
            className="w-full bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                  <LogOut className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Sair</p>
                  <p className="text-sm text-gray-500">Desconectar da conta</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-8 mb-20 px-4">
          <p>WorldPav - Sistema de Gestão de Pavimentação</p>
          <p className="mt-1">Versão 1.0.0</p>
        </div>
      </div>
    </Layout>
  )
}

