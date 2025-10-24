import { createBrowserRouter } from 'react-router-dom'
import { RequireAuth } from '../components/layout/RequireAuth'
import { GenericError } from '../pages/errors/GenericError'

// ==================== IMPORTS DE PÁGINAS ====================

// Autenticação & Dashboard
import { Login } from '../pages/auth/LoginSimple'
import Dashboard from '../pages/Dashboard'
import DashboardPavimentacao from '../pages/DashboardPavimentacao'
import MoreMenu from '../pages/mobile/MoreMenu'

// Clientes
import ClientsList from '../pages/clients/ClientsList'
import NewClient from '../pages/clients/NewClient'
import ClientDetailsNew from '../pages/clients/ClientDetailsNew'
import ClientEdit from '../pages/clients/ClientEdit'

// Maquinários
import MaquinariosList from '../pages/maquinarios/MaquinariosList'
import NovoMaquinario from '../pages/maquinarios/NovoMaquinario'
import EditarMaquinario from '../pages/maquinarios/EditarMaquinario'
import DetalhesMaquinario from '../pages/maquinarios/DetalhesMaquinario'

// Colaboradores
import ColaboradoresList from '../pages/colaboradores/ColaboradoresListMock'
import ColaboradorDetalhes from '../pages/colaboradores/ColaboradorDetalhes'
import ColaboradorEdit from '../pages/colaboradores/ColaboradorEdit'
import NovoColaborador from '../pages/colaboradores/NovoColaborador'

// Reports
import ReportsList from '../pages/reports/ReportsList'
import NewReportImproved from '../pages/reports/NewReportImproved'
import ReportDetails from '../pages/reports/ReportDetails'
import EditReport from '../pages/reports/EditReport'

// Notes
import { NotesListSimple as NotesList } from '../pages/notes/NotesListSimple'
import { NewNote } from '../pages/notes/NewNote'
import { NotesPendingReports } from '../pages/notes/NotesPendingReports'
import { NoteDetails } from '../pages/notes/NoteDetails'

// Recebimentos
import RecebimentosIndex from '../pages/recebimentos/RecebimentosIndex'
import { RecebimentosPage } from '../pages/recebimentos/RecebimentosPage'

// Programação de Pavimentação
import ProgramacaoPavimentacaoList from '../pages/programacao/ProgramacaoPavimentacaoList'
import ProgramacaoPavimentacaoForm from '../pages/programacao/ProgramacaoPavimentacaoForm'

// Obras
import ObrasList from '../pages/obras/ObrasList'
import ObraDetails from '../pages/obras/ObraDetails'
import NovaObra from '../pages/obras/NovaObra'
import EditarObra from '../pages/obras/EditarObra'

// Financeiro
import { FinancialDashboard } from '../pages/financial/FinancialDashboard'

// Serviços
import ServicosList from '../pages/servicos/ServicosList'
import NovoServico from '../pages/servicos/NovoServico'

// Relatórios Diários
import RelatoriosDiariosList from '../pages/relatorios-diarios/RelatoriosDiariosList'
import NovoRelatorioDiario from '../pages/relatorios-diarios/NovoRelatorioDiario'
import RelatorioDiarioDetails from '../pages/relatorios-diarios/RelatorioDiarioDetails'

// Parceiros
import ParceirosList from '../pages/parceiros/ParceirosList'
import ParceiroDetails from '../pages/parceiros/ParceiroDetails'
import NovoParceiro from '../pages/parceiros/NovoParceiro'
import EditarParceiro from '../pages/parceiros/EditarParceiro'
import NovoCarregamento from '../pages/parceiros/NovoCarregamento'

// Guardas
import GuardasIndex from '../pages/guardas/GuardasIndex'

// Controle Diário
import ControleDiarioIndex from '../pages/controle-diario/ControleDiarioIndex'
import NovaRelacaoDiaria from '../pages/controle-diario/NovaRelacaoDiaria'

// Contas a Pagar
import ContasPagarList from '../pages/contas-pagar/ContasPagarList'
import ContaPagarForm from '../pages/contas-pagar/ContaPagarForm'
import ContaPagarDetails from '../pages/contas-pagar/ContaPagarDetails'

// Demos (Desenvolvimento)
import ModernSidebarDemo from '../pages/ModernSidebarDemo'

export const router = createBrowserRouter([
  // ==================== AUTENTICAÇÃO ====================
  {
    path: '/login',
    element: <Login />,
    errorElement: <GenericError />
  },

  // ==================== DASHBOARD ====================
  {
    path: '/',
    element: (
      <RequireAuth>
        <DashboardPavimentacao />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },
  {
    path: '/dashboard-old',
    element: (
      <RequireAuth>
        <Dashboard />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },

  // ==================== MOBILE ====================
  {
    path: '/more',
    element: (
      <RequireAuth>
        <MoreMenu />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },

  // ==================== CLIENTES ====================
  {
    path: '/clients',
    element: (
      <RequireAuth>
        <ClientsList />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },
  {
    path: '/clients/new',
    element: (
      <RequireAuth>
        <NewClient />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },
  {
    path: '/clients/:id',
    element: (
      <RequireAuth>
        <ClientDetailsNew />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },
  {
    path: '/clients/:id/edit',
    element: (
      <RequireAuth>
        <ClientEdit />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },
  // ==================== MAQUINÁRIOS ====================
  {
    path: '/maquinarios',
    element: (
      <RequireAuth>
        <MaquinariosList />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },
  {
    path: '/maquinarios/new',
    element: (
      <RequireAuth>
        <NovoMaquinario />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },
  {
    path: '/maquinarios/:id',
    element: (
      <RequireAuth>
        <DetalhesMaquinario />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },
  {
    path: '/maquinarios/:id/edit',
    element: (
      <RequireAuth>
        <EditarMaquinario />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },

  // ==================== COLABORADORES ====================
  {
    path: '/colaboradores',
    element: (
      <RequireAuth>
        <ColaboradoresList />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },
  {
    path: '/colaboradores/new',
    element: (
      <RequireAuth>
        <NovoColaborador />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },
  {
    path: '/colaboradores/:id',
    element: (
      <RequireAuth>
        <ColaboradorDetalhes />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },
  {
    path: '/colaboradores/:id/edit',
    element: (
      <RequireAuth>
        <ColaboradorEdit />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },

  // ==================== RELATÓRIOS (REPORTS) ====================
  {
    path: '/reports',
    element: (
      <RequireAuth>
        <ReportsList />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },
  {
    path: '/reports/new',
    element: (
      <RequireAuth>
        <NewReportImproved />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },
  {
    path: '/reports/:id',
    element: (
      <RequireAuth>
        <ReportDetails />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },
  {
    path: '/reports/:id/edit',
    element: (
      <RequireAuth>
        <EditReport />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },

  // ==================== ANOTAÇÕES (NOTES) ====================
  {
    path: '/notes',
    element: (
      <RequireAuth>
        <NotesList />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },
  {
    path: '/notes/new',
    element: (
      <RequireAuth>
        <NewNote />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },
  {
    path: '/notes/pending',
    element: (
      <RequireAuth>
        <NotesPendingReports />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },
  {
    path: '/notes/:id',
    element: (
      <RequireAuth>
        <NoteDetails />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },

  // ==================== RECEBIMENTOS ====================
  {
    path: '/pagamentos-receber',
    element: (
      <RequireAuth>
        <RecebimentosIndex />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },
  {
    path: '/recebimentos',
    element: (
      <RequireAuth>
        <RecebimentosPage />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },
  // ==================== PROGRAMAÇÃO DE PAVIMENTAÇÃO ====================
  {
    path: '/programacao-pavimentacao',
    element: (
      <RequireAuth>
        <ProgramacaoPavimentacaoList />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },
  {
    path: '/programacao-pavimentacao/nova',
    element: (
      <RequireAuth>
        <ProgramacaoPavimentacaoForm />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },
  {
    path: '/programacao-pavimentacao/:id/edit',
    element: (
      <RequireAuth>
        <ProgramacaoPavimentacaoForm />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },
  // ==================== OBRAS ====================
  {
    path: '/obras',
    element: (
      <RequireAuth>
        <ObrasList />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },
  {
    path: '/obras/new',
    element: (
      <RequireAuth>
        <NovaObra />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },
  {
    path: '/obras/:id/edit',
    element: (
      <RequireAuth>
        <EditarObra />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },
  {
    path: '/obras/:id',
    element: (
      <RequireAuth>
        <ObraDetails />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },

  // ==================== FINANCEIRO ====================
  {
    path: '/financial',
    element: (
      <RequireAuth>
        <FinancialDashboard />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },

  // ==================== SERVIÇOS ====================
  {
    path: '/servicos',
    element: (
      <RequireAuth>
        <ServicosList />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },
  {
    path: '/servicos/new',
    element: (
      <RequireAuth>
        <NovoServico />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },
  // ==================== RELATÓRIOS DIÁRIOS ====================
  {
    path: '/relatorios-diarios',
    element: (
      <RequireAuth>
        <RelatoriosDiariosList />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },
  {
    path: '/relatorios-diarios/novo',
    element: (
      <RequireAuth>
        <NovoRelatorioDiario />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },
  {
    path: '/relatorios-diarios/:id',
    element: (
      <RequireAuth>
        <RelatorioDiarioDetails />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },

  // ==================== PARCEIROS ====================
  {
    path: '/parceiros',
    element: (
      <RequireAuth>
        <ParceirosList />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },
  {
    path: '/parceiros/novo',
    element: (
      <RequireAuth>
        <NovoParceiro />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },
  {
    path: '/parceiros/:id',
    element: (
      <RequireAuth>
        <ParceiroDetails />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },
  {
    path: '/parceiros/:id/editar',
    element: (
      <RequireAuth>
        <EditarParceiro />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },
  {
    path: '/parceiros/:id/novo-carregamento',
    element: (
      <RequireAuth>
        <NovoCarregamento />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },

  // ==================== GUARDAS ====================
  {
    path: '/guardas',
    element: (
      <RequireAuth>
        <GuardasIndex />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },

  // ==================== CONTROLE DIÁRIO ====================
  {
    path: '/controle-diario',
    element: (
      <RequireAuth>
        <ControleDiarioIndex />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },
  {
    path: '/controle-diario/nova-relacao',
    element: (
      <RequireAuth>
        <NovaRelacaoDiaria />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },

  // ==================== CONTAS A PAGAR ====================
  {
    path: '/contas-pagar',
    element: (
      <RequireAuth>
        <ContasPagarList />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },
  {
    path: '/contas-pagar/nova',
    element: (
      <RequireAuth>
        <ContaPagarForm />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },
  {
    path: '/contas-pagar/:id',
    element: (
      <RequireAuth>
        <ContaPagarDetails />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },
  {
    path: '/contas-pagar/:id/editar',
    element: (
      <RequireAuth>
        <ContaPagarForm />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },

  // ==================== DEMOS (DESENVOLVIMENTO) ====================
  {
    path: '/modern-sidebar-demo',
    element: (
      <RequireAuth>
        <ModernSidebarDemo />
      </RequireAuth>
    ),
    errorElement: <GenericError />
  },
])
















