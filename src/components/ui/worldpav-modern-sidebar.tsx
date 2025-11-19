"use client";
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Construction, 
  ClipboardList, 
  Calculator, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Search,
  User,
  Handshake,
  Calendar,
  UserCheck,
  Shield,
  ClipboardCheck,
  CreditCard,
  FileText,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../../lib/auth-hooks';

interface NavigationItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: string;
}

interface WorldPavModernSidebarProps {
  className?: string;
  onNavigate?: (href: string) => void;
}

// Navegação específica para WorldPav
const navigationItems: NavigationItem[] = [
  { id: "dashboard", name: "Dashboard", icon: LayoutDashboard, href: "/" },
  { id: "clientes", name: "Clientes", icon: Users, href: "/clients" },
  { id: "obras", name: "Obras", icon: Construction, href: "/obras" },
  { id: "programacao", name: "Programação", icon: Calendar, href: "/programacao-pavimentacao" },
  { id: "colaboradores", name: "Colaboradores", icon: UserCheck, href: "/colaboradores" },
  { id: "equipes", name: "Equipes", icon: Users, href: "/equipes" },
  { id: "funcoes", name: "Funções", icon: Briefcase, href: "/funcoes" },
  { id: "controle-diario", name: "Controle Diário", icon: ClipboardCheck, href: "/controle-diario" },
  { id: "relatorios-diarios", name: "Relatórios Diários", icon: ClipboardList, href: "/relatorios-diarios" },
  { id: "recebimentos", name: "Recebimentos", icon: CreditCard, href: "/recebimentos" },
  { id: "contas-pagar", name: "Contas a Pagar", icon: FileText, href: "/contas-pagar" },
  { id: "financeiro", name: "Financeiro", icon: Calculator, href: "/financial" },
  { id: "maquinarios", name: "Equipamentos", icon: Settings, href: "/maquinarios" },
  { id: "parceiros", name: "Parceiros", icon: Handshake, href: "/parceiros" },
  { id: "guardas", name: "Guardas", icon: Shield, href: "/guardas" },
];

export function WorldPavModernSidebar({ className = "", onNavigate }: WorldPavModernSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  
  // Detectar rota ativa baseada na URL atual
  const getCurrentActiveItem = () => {
    const path = window.location.pathname;
    if (path === '/') return 'dashboard';
    if (path.startsWith('/clients')) return 'clientes';
    if (path.startsWith('/obras')) return 'obras';
    if (path.startsWith('/programacao-pavimentacao')) return 'programacao';
  if (path.startsWith('/colaboradores')) return 'colaboradores';
  if (path.startsWith('/equipes')) return 'equipes';
  if (path.startsWith('/funcoes')) return 'funcoes';
  if (path.startsWith('/controle-diario')) return 'controle-diario';
    if (path.startsWith('/relatorios-diarios')) return 'relatorios-diarios';
    if (path.startsWith('/recebimentos')) return 'recebimentos';
    if (path.startsWith('/contas-pagar')) return 'contas-pagar';
    if (path.startsWith('/financial')) return 'financeiro';
    if (path.startsWith('/maquinarios')) return 'maquinarios';
    if (path.startsWith('/parceiros')) return 'parceiros';
    if (path.startsWith('/guardas')) return 'guardas';
    return 'dashboard';
  };
  
  const [activeItem, setActiveItem] = useState(getCurrentActiveItem());

  // Auto-open sidebar on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Atualizar item ativo quando a rota mudar
  useEffect(() => {
    setActiveItem(getCurrentActiveItem());
  }, [window.location.pathname]);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleItemClick = (itemId: string, href: string) => {
    setActiveItem(itemId);
    if (onNavigate) {
      onNavigate(href);
    }
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  const handleLogout = () => {
    signOut();
  };

  // Função para obter o nome do usuário
  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'Usuário WorldPav';
  };

  // Função para obter o primeiro nome do usuário
  const getFirstName = () => {
    const fullName = getUserDisplayName();
    return fullName.split(' ')[0];
  };

  // Função para obter a saudação personalizada
  const getGreeting = () => {
    const firstName = getFirstName();
    return `Olá, ${firstName} 👋🏻`;
  };

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-6 left-6 z-50 p-3 rounded-lg bg-white shadow-md border border-slate-100 md:hidden hover:bg-slate-50 transition-all duration-200"
        aria-label="Toggle sidebar"
      >
        {isOpen ? 
          <X className="h-5 w-5 text-slate-600" /> : 
          <Menu className="h-5 w-5 text-slate-600" />
        }
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300" 
          onClick={toggleSidebar} 
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-slate-200 z-40 transition-all duration-300 ease-in-out flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          w-80
          md:translate-x-0 md:static md:z-auto
          ${className}
        `}
      >
        {/* Header with logo */}
        <div className="flex items-center p-5 border-b border-slate-200 bg-slate-50/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-base">W</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-slate-800 text-base">WorldPav</span>
              <span className="text-xs text-slate-500">Sistema de Gestão</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto">
          <ul className="space-y-0.5">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleItemClick(item.id, item.href)}
                    className={`
                      w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-md text-left transition-all duration-200 group
                      ${isActive
                        ? "bg-primary-50 text-primary-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }
                    `}
                  >
                    <div className="flex items-center justify-center min-w-[24px]">
                      <Icon
                        className={`
                          h-4.5 w-4.5 flex-shrink-0
                          ${isActive 
                            ? "text-primary-600" 
                            : "text-slate-500 group-hover:text-slate-700"
                          }
                        `}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-sm ${isActive ? "font-medium" : "font-normal"}`}>{item.name}</span>
                      {item.badge && (
                        <span className={`
                          px-1.5 py-0.5 text-xs font-medium rounded-full
                          ${isActive
                            ? "bg-primary-100 text-primary-700"
                            : "bg-slate-100 text-slate-600"
                          }
                        `}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom section with profile and logout */}
        <div className="mt-auto border-t border-slate-200">
          {/* Profile Section */}
          <div className="border-b border-slate-200 bg-slate-50/30 p-3">
            <div className="flex items-center px-3 py-2 rounded-md bg-white hover:bg-slate-50 transition-colors duration-200">
              <div className="w-8 h-8 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0 ml-2.5">
                <p className="text-sm font-medium text-slate-800 truncate">{getGreeting()}</p>
                <p className="text-xs text-slate-500 truncate">Sistema de Gestão</p>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full ml-2" title="Online" />
            </div>
          </div>

          {/* Logout Button */}
          <div className="p-3">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-md text-left transition-all duration-200 group text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <div className="flex items-center justify-center min-w-[24px]">
                <LogOut className="h-4.5 w-4.5 flex-shrink-0 text-red-500 group-hover:text-red-600" />
              </div>
              <span className="text-sm">Sair</span>
            </button>
          </div>
        </div>
      </div>

    </>
  );
}
