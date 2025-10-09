import React, { useState } from 'react';
import { Layout } from '../../components/Layout';
import { Button } from '../../components/Button';
import { ProgramacaoCalendar } from '../../components/ProgramacaoCalendar';
import { useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { exportarProgramacaoDiaPDF } from '../../utils/pdfExport';
import { toast } from 'sonner';
import { 
  Calendar as CalendarIcon, 
  Plus,
  Download,
  TrendingUp,
  CheckCircle2,
  Clock
} from 'lucide-react';

// Dados mockados de programações (DATA ÚNICA)
const PROGRAMACOES_MOCK = [
  {
    id: '1',
    data_programacao: format(new Date(), 'yyyy-MM-dd'),
    cliente: 'Prefeitura Municipal',
    obra: 'Avenida Brasil - Recapeamento',
    equipe: 'Equipe A',
    localizacao: 'Av. Brasil, km 10 - Centro',
    maquinarios: ['Vibroacabadora', 'Rolo Pneumático', 'Caminhão Pipa'],
    status: 'em_andamento' as const,
  },
  {
    id: '2',
    data_programacao: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    cliente: 'Construtora Alfa',
    obra: 'Condomínio Sol - Pavimentação Interna',
    equipe: 'Equipe B',
    localizacao: 'Rua das Acácias, 500 - Jardim Primavera',
    maquinarios: ['Vibroacabadora', 'Rolo Compactador'],
    status: 'agendada' as const,
  },
  {
    id: '3',
    data_programacao: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
    cliente: 'Prefeitura Municipal',
    obra: 'Rua das Flores - Manutenção',
    equipe: 'Equipe C',
    localizacao: 'Rua das Flores - Bairro Alto',
    maquinarios: ['Fresadora', 'Vibroacabadora', 'Rolo Pneumático', 'Caminhão Pipa'],
    status: 'agendada' as const,
  },
  {
    id: '4',
    data_programacao: format(addDays(new Date(), -2), 'yyyy-MM-dd'),
    cliente: 'Construtora Beta',
    obra: 'Distrito Industrial - Pátio de Estacionamento',
    equipe: 'Equipe A',
    localizacao: 'Distrito Industrial - Setor 3',
    maquinarios: ['Vibroacabadora', 'Rolo Compactador', 'Escavadeira'],
    status: 'concluida' as const,
  },
  {
    id: '5',
    data_programacao: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
    cliente: 'Construtora Alfa',
    obra: 'Residencial Vila Nova - Acesso Principal',
    equipe: 'Equipe B',
    localizacao: 'Av. dos Bandeirantes, km 8',
    maquinarios: ['Vibroacabadora', 'Rolo Pneumático'],
    status: 'agendada' as const,
  },
  {
    id: '6',
    data_programacao: format(new Date(), 'yyyy-MM-dd'),
    cliente: 'Prefeitura Municipal',
    obra: 'Via Expressa Norte - Trecho 2',
    equipe: 'Equipe C',
    localizacao: 'Via Expressa Norte - km 12 ao km 15',
    maquinarios: ['Fresadora', 'Vibroacabadora', 'Rolo Pneumático', 'Rolo Compactador', 'Caminhão Pipa'],
    status: 'em_andamento' as const,
  },
  {
    id: '7',
    data_programacao: format(addDays(new Date(), 4), 'yyyy-MM-dd'),
    cliente: 'Shopping Center XYZ',
    obra: 'Estacionamento Shopping - Ampliação',
    equipe: 'Equipe A',
    localizacao: 'Shopping Center XYZ - Zona Sul',
    maquinarios: ['Vibroacabadora', 'Rolo Compactador', 'Caminhão Pipa'],
    status: 'agendada' as const,
  },
];

export default function ProgramacaoList() {
  const navigate = useNavigate();
  const [programacoes] = useState(PROGRAMACOES_MOCK);

  const handleNewScheduling = () => {
    navigate('/programacao/nova');
  };

  const handleDayClick = (date: Date) => {
    console.log('Dia selecionado:', format(date, 'dd/MM/yyyy'));
  };

  const handleProgramacaoClick = (programacao: any) => {
    console.log('Programação clicada:', programacao);
    toast.info(`Visualizando: ${programacao.obra}`, {
      description: `Cliente: ${programacao.cliente}`,
    });
  };

  const handleExportDay = (date: Date, programacoesDay: any[]) => {
    if (programacoesDay.length === 0) {
      toast.warning('Nenhuma programação neste dia');
      return;
    }

    exportarProgramacaoDiaPDF(date, programacoesDay);
    toast.success('PDF gerado com sucesso!', {
      description: `${programacoesDay.length} programação(ões) exportada(s)`,
    });
  };

  // Estatísticas
  const totalProgramacoes = programacoes.length;
  const agendadas = programacoes.filter(p => p.status === 'agendada').length;
  const emAndamento = programacoes.filter(p => p.status === 'em_andamento').length;
  const concluidas = programacoes.filter(p => p.status === 'concluida').length;

  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-[1800px] mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <CalendarIcon className="w-8 h-8 text-blue-600" />
                Programação de Obras
              </h1>
              <p className="text-gray-600 mt-1">
                Gerencie e acompanhe todas as programações de pavimentação
              </p>
            </div>
            <Button 
              onClick={handleNewScheduling}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Programação
            </Button>
          </div>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{totalProgramacoes}</p>
                  <p className="text-xs text-gray-500 mt-1">programações</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-blue-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Agendadas</p>
                  <p className="text-3xl font-bold text-blue-900 mt-1">{agendadas}</p>
                  <p className="text-xs text-blue-600 mt-1">obras planejadas</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <CalendarIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-yellow-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Em Andamento</p>
                  <p className="text-3xl font-bold text-yellow-900 mt-1">{emAndamento}</p>
                  <p className="text-xs text-yellow-600 mt-1">obras ativas</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-green-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Concluídas</p>
                  <p className="text-3xl font-bold text-green-900 mt-1">{concluidas}</p>
                  <p className="text-xs text-green-600 mt-1">obras finalizadas</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Calendário Visual */}
          <ProgramacaoCalendar
            programacoes={programacoes}
            onDayClick={handleDayClick}
            onProgramacaoClick={handleProgramacaoClick}
            onExportDay={handleExportDay}
          />

          {/* Botão de Exportação PDF */}
          <div className="bg-white border-2 border-blue-200 rounded-xl p-6 shadow-lg">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Download className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-lg font-bold text-gray-900">Exportar Programação em PDF</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Selecione um dia com programações no calendário acima e clique no botão para gerar um PDF profissional 
                    com todas as informações. Ideal para enviar à sua equipe!
                  </p>
                </div>
              </div>
              <Button
                onClick={() => {
                  const hoje = new Date();
                  const programacoesHoje = programacoes.filter(p => {
                    const dataProg = new Date(p.data_programacao + 'T00:00:00');
                    return dataProg.toDateString() === hoje.toDateString();
                  });
                  handleExportDay(hoje, programacoesHoje);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md whitespace-nowrap"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar Hoje
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
