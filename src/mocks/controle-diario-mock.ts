/**
 * Mock: Controle Diário
 * Dados mock para controle diário de colaboradores
 */

import { v4 as uuidv4 } from 'uuid';
import {
  RelacaoDiaria,
  RelacaoDiariaCompleta,
  RegistroPresencaRelacao,
  RegistroDiaria,
  ResumoDiariasColaborador,
  EstatisticasControleDiario,
  CreateRelacaoDiariaData,
  CreateRegistroDiariaData,
  calcularValorTotalDiaria,
} from '../types/controle-diario';

// Mock de Relações Diárias
let mockRelacoesDiarias: RelacaoDiariaCompleta[] = [
  {
    id: 'rel-001',
    data: '2025-10-15',
    equipe_id: 'eq-001',
    equipe_nome: 'Equipe Alpha',
    equipe_tipo: 'propria',
    total_presentes: 8,
    total_ausencias: 2,
    observacoes_dia: 'Dia de trabalho normal. Alguns colaboradores com atestado médico.',
    created_at: '2025-10-15T08:00:00Z',
    updated_at: '2025-10-15T08:00:00Z',
    registros: [
      // Presentes
      {
        id: 'reg-001',
        relacao_diaria_id: 'rel-001',
        colaborador_id: 'col-001',
        colaborador_nome: 'João Silva',
        colaborador_funcao: 'Operador de Máquinas',
        status: 'presente',
        created_at: '2025-10-15T08:00:00Z',
        updated_at: '2025-10-15T08:00:00Z',
      },
      {
        id: 'reg-002',
        relacao_diaria_id: 'rel-001',
        colaborador_id: 'col-002',
        colaborador_nome: 'Maria Santos',
        colaborador_funcao: 'Operadora de Vibroacabadora',
        status: 'presente',
        created_at: '2025-10-15T08:00:00Z',
        updated_at: '2025-10-15T08:00:00Z',
      },
      {
        id: 'reg-003',
        relacao_diaria_id: 'rel-001',
        colaborador_id: 'col-003',
        colaborador_nome: 'Pedro Costa',
        colaborador_funcao: 'Operador de Rolo Compactador',
        status: 'presente',
        created_at: '2025-10-15T08:00:00Z',
        updated_at: '2025-10-15T08:00:00Z',
      },
      {
        id: 'reg-004',
        relacao_diaria_id: 'rel-001',
        colaborador_id: 'col-004',
        colaborador_nome: 'Ana Paula',
        colaborador_funcao: 'Ajudante Geral',
        status: 'presente',
        created_at: '2025-10-15T08:00:00Z',
        updated_at: '2025-10-15T08:00:00Z',
      },
      {
        id: 'reg-005',
        relacao_diaria_id: 'rel-001',
        colaborador_id: 'col-005',
        colaborador_nome: 'Carlos Eduardo',
        colaborador_funcao: 'Motorista de Caminhão',
        status: 'presente',
        created_at: '2025-10-15T08:00:00Z',
        updated_at: '2025-10-15T08:00:00Z',
      },
      {
        id: 'reg-006',
        relacao_diaria_id: 'rel-001',
        colaborador_id: 'col-006',
        colaborador_nome: 'Fernanda Lima',
        colaborador_funcao: 'Ajudante Geral',
        status: 'presente',
        created_at: '2025-10-15T08:00:00Z',
        updated_at: '2025-10-15T08:00:00Z',
      },
      {
        id: 'reg-007',
        relacao_diaria_id: 'rel-001',
        colaborador_id: 'col-007',
        colaborador_nome: 'Roberto Alves',
        colaborador_funcao: 'Encarregado de Obra',
        status: 'presente',
        created_at: '2025-10-15T08:00:00Z',
        updated_at: '2025-10-15T08:00:00Z',
      },
      {
        id: 'reg-008',
        relacao_diaria_id: 'rel-001',
        colaborador_id: 'col-008',
        colaborador_nome: 'Juliana Souza',
        colaborador_funcao: 'Operadora de Máquinas',
        status: 'presente',
        created_at: '2025-10-15T08:00:00Z',
        updated_at: '2025-10-15T08:00:00Z',
      },
      // Ausências
      {
        id: 'reg-009',
        relacao_diaria_id: 'rel-001',
        colaborador_id: 'col-009',
        colaborador_nome: 'Marcos Pereira',
        colaborador_funcao: 'Ajudante Geral',
        status: 'atestado',
        observacoes: 'Consulta médica agendada',
        created_at: '2025-10-15T08:00:00Z',
        updated_at: '2025-10-15T08:00:00Z',
      },
      {
        id: 'reg-010',
        relacao_diaria_id: 'rel-001',
        colaborador_id: 'col-010',
        colaborador_nome: 'Patrícia Rocha',
        colaborador_funcao: 'Motorista',
        status: 'falta',
        observacoes: 'Não justificou',
        created_at: '2025-10-15T08:00:00Z',
        updated_at: '2025-10-15T08:00:00Z',
      },
    ],
  },
  {
    id: 'rel-002',
    data: '2025-10-16',
    equipe_id: 'eq-002',
    equipe_nome: 'Equipe Beta',
    equipe_tipo: 'propria',
    total_presentes: 7,
    total_ausencias: 3,
    observacoes_dia: 'Trabalho no fim de semana. Uma mudança de equipe registrada.',
    created_at: '2025-10-16T08:00:00Z',
    updated_at: '2025-10-16T08:00:00Z',
    registros: [
      // Presentes
      {
        id: 'reg-011',
        relacao_diaria_id: 'rel-002',
        colaborador_id: 'col-011',
        colaborador_nome: 'Lucas Martins',
        colaborador_funcao: 'Operador de Rolo',
        status: 'presente',
        created_at: '2025-10-16T08:00:00Z',
        updated_at: '2025-10-16T08:00:00Z',
      },
      {
        id: 'reg-012',
        relacao_diaria_id: 'rel-002',
        colaborador_id: 'col-012',
        colaborador_nome: 'Carla Dias',
        colaborador_funcao: 'Ajudante Geral',
        status: 'presente',
        created_at: '2025-10-16T08:00:00Z',
        updated_at: '2025-10-16T08:00:00Z',
      },
      {
        id: 'reg-013',
        relacao_diaria_id: 'rel-002',
        colaborador_id: 'col-013',
        colaborador_nome: 'Ricardo Gomes',
        colaborador_funcao: 'Motorista',
        status: 'presente',
        created_at: '2025-10-16T08:00:00Z',
        updated_at: '2025-10-16T08:00:00Z',
      },
      {
        id: 'reg-014',
        relacao_diaria_id: 'rel-002',
        colaborador_id: 'col-014',
        colaborador_nome: 'Beatriz Silva',
        colaborador_funcao: 'Operadora de Vibroacabadora',
        status: 'presente',
        created_at: '2025-10-16T08:00:00Z',
        updated_at: '2025-10-16T08:00:00Z',
      },
      {
        id: 'reg-015',
        relacao_diaria_id: 'rel-002',
        colaborador_id: 'col-015',
        colaborador_nome: 'André Santos',
        colaborador_funcao: 'Encarregado',
        status: 'presente',
        created_at: '2025-10-16T08:00:00Z',
        updated_at: '2025-10-16T08:00:00Z',
      },
      {
        id: 'reg-016',
        relacao_diaria_id: 'rel-002',
        colaborador_id: 'col-016',
        colaborador_nome: 'Gabriela Oliveira',
        colaborador_funcao: 'Ajudante Geral',
        status: 'presente',
        created_at: '2025-10-16T08:00:00Z',
        updated_at: '2025-10-16T08:00:00Z',
      },
      {
        id: 'reg-017',
        relacao_diaria_id: 'rel-002',
        colaborador_id: 'col-017',
        colaborador_nome: 'Thiago Mendes',
        colaborador_funcao: 'Operador de Máquinas',
        status: 'presente',
        created_at: '2025-10-16T08:00:00Z',
        updated_at: '2025-10-16T08:00:00Z',
      },
      // Ausências
      {
        id: 'reg-018',
        relacao_diaria_id: 'rel-002',
        colaborador_id: 'col-018',
        colaborador_nome: 'Renata Costa',
        colaborador_funcao: 'Ajudante Geral',
        status: 'mudanca_equipe',
        equipe_destino_id: 'eq-003',
        equipe_destino_nome: 'Equipe Gamma',
        observacoes: 'Transferida para obra em Campinas',
        created_at: '2025-10-16T08:00:00Z',
        updated_at: '2025-10-16T08:00:00Z',
      },
      {
        id: 'reg-019',
        relacao_diaria_id: 'rel-002',
        colaborador_id: 'col-019',
        colaborador_nome: 'Paulo Henrique',
        colaborador_funcao: 'Motorista',
        status: 'atestado',
        observacoes: 'Atestado de 3 dias',
        created_at: '2025-10-16T08:00:00Z',
        updated_at: '2025-10-16T08:00:00Z',
      },
      {
        id: 'reg-020',
        relacao_diaria_id: 'rel-002',
        colaborador_id: 'col-020',
        colaborador_nome: 'Vanessa Lima',
        colaborador_funcao: 'Operadora',
        status: 'falta',
        created_at: '2025-10-16T08:00:00Z',
        updated_at: '2025-10-16T08:00:00Z',
      },
    ],
  },
  {
    id: 'rel-003',
    data: '2025-10-17',
    equipe_id: 'eq-001',
    equipe_nome: 'Equipe Alpha',
    equipe_tipo: 'propria',
    total_presentes: 10,
    total_ausencias: 0,
    observacoes_dia: 'Dia produtivo, todos presentes. Obra concluída conforme planejado.',
    created_at: '2025-10-17T08:00:00Z',
    updated_at: '2025-10-17T08:00:00Z',
    registros: [
      {
        id: 'reg-021',
        relacao_diaria_id: 'rel-003',
        colaborador_id: 'col-001',
        colaborador_nome: 'João Silva',
        colaborador_funcao: 'Operador de Máquinas',
        status: 'presente',
        created_at: '2025-10-17T08:00:00Z',
        updated_at: '2025-10-17T08:00:00Z',
      },
      {
        id: 'reg-022',
        relacao_diaria_id: 'rel-003',
        colaborador_id: 'col-002',
        colaborador_nome: 'Maria Santos',
        colaborador_funcao: 'Operadora de Vibroacabadora',
        status: 'presente',
        created_at: '2025-10-17T08:00:00Z',
        updated_at: '2025-10-17T08:00:00Z',
      },
      {
        id: 'reg-023',
        relacao_diaria_id: 'rel-003',
        colaborador_id: 'col-003',
        colaborador_nome: 'Pedro Costa',
        colaborador_funcao: 'Operador de Rolo Compactador',
        status: 'presente',
        created_at: '2025-10-17T08:00:00Z',
        updated_at: '2025-10-17T08:00:00Z',
      },
      {
        id: 'reg-024',
        relacao_diaria_id: 'rel-003',
        colaborador_id: 'col-004',
        colaborador_nome: 'Ana Paula',
        colaborador_funcao: 'Ajudante Geral',
        status: 'presente',
        created_at: '2025-10-17T08:00:00Z',
        updated_at: '2025-10-17T08:00:00Z',
      },
      {
        id: 'reg-025',
        relacao_diaria_id: 'rel-003',
        colaborador_id: 'col-005',
        colaborador_nome: 'Carlos Eduardo',
        colaborador_funcao: 'Motorista de Caminhão',
        status: 'presente',
        created_at: '2025-10-17T08:00:00Z',
        updated_at: '2025-10-17T08:00:00Z',
      },
      {
        id: 'reg-026',
        relacao_diaria_id: 'rel-003',
        colaborador_id: 'col-006',
        colaborador_nome: 'Fernanda Lima',
        colaborador_funcao: 'Ajudante Geral',
        status: 'presente',
        created_at: '2025-10-17T08:00:00Z',
        updated_at: '2025-10-17T08:00:00Z',
      },
      {
        id: 'reg-027',
        relacao_diaria_id: 'rel-003',
        colaborador_id: 'col-007',
        colaborador_nome: 'Roberto Alves',
        colaborador_funcao: 'Encarregado de Obra',
        status: 'presente',
        created_at: '2025-10-17T08:00:00Z',
        updated_at: '2025-10-17T08:00:00Z',
      },
      {
        id: 'reg-028',
        relacao_diaria_id: 'rel-003',
        colaborador_id: 'col-008',
        colaborador_nome: 'Juliana Souza',
        colaborador_funcao: 'Operadora de Máquinas',
        status: 'presente',
        created_at: '2025-10-17T08:00:00Z',
        updated_at: '2025-10-17T08:00:00Z',
      },
      {
        id: 'reg-029',
        relacao_diaria_id: 'rel-003',
        colaborador_id: 'col-009',
        colaborador_nome: 'Marcos Pereira',
        colaborador_funcao: 'Ajudante Geral',
        status: 'presente',
        created_at: '2025-10-17T08:00:00Z',
        updated_at: '2025-10-17T08:00:00Z',
      },
      {
        id: 'reg-030',
        relacao_diaria_id: 'rel-003',
        colaborador_id: 'col-010',
        colaborador_nome: 'Patrícia Rocha',
        colaborador_funcao: 'Motorista',
        status: 'presente',
        created_at: '2025-10-17T08:00:00Z',
        updated_at: '2025-10-17T08:00:00Z',
      },
    ],
  },
];

// Mock de Registros de Diárias (pagamentos)
let mockRegistrosDiarias: RegistroDiaria[] = [
  {
    id: 'diaria-001',
    colaborador_id: 'col-001',
    colaborador_nome: 'João Silva',
    colaborador_funcao: 'Operador de Máquinas',
    quantidade: 2,
    valor_unitario: 150.0,
    adicional: 50.0,
    desconto: 0,
    valor_total: 350.0,
    data_diaria: '2025-10-15',
    data_pagamento: '2025-10-25',
    status_pagamento: 'pendente',
    observacoes: 'Trabalho noturno',
    relacao_diaria_id: 'rel-001',
    created_at: '2025-10-15T18:00:00Z',
    updated_at: '2025-10-15T18:00:00Z',
  },
  {
    id: 'diaria-002',
    colaborador_id: 'col-002',
    colaborador_nome: 'Maria Santos',
    colaborador_funcao: 'Operadora de Vibroacabadora',
    quantidade: 1,
    valor_unitario: 150.0,
    adicional: 0,
    desconto: 0,
    valor_total: 150.0,
    data_diaria: '2025-10-16',
    data_pagamento: '2025-10-25',
    status_pagamento: 'pago',
    observacoes: 'Fim de semana',
    relacao_diaria_id: 'rel-002',
    created_at: '2025-10-16T18:00:00Z',
    updated_at: '2025-10-20T10:00:00Z',
  },
];

// ==================== RELAÇÕES DIÁRIAS ====================

export function listarRelacoesDiarias(): RelacaoDiariaCompleta[] {
  return [...mockRelacoesDiarias].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  );
}

export function getRelacaoDiariaById(id: string): RelacaoDiariaCompleta | undefined {
  return mockRelacoesDiarias.find((r) => r.id === id);
}

export function getRelacoesDiariasByEquipe(equipeId: string): RelacaoDiariaCompleta[] {
  return mockRelacoesDiarias.filter((r) => r.equipe_id === equipeId);
}

export function getRelacoesDiariasByData(data: string): RelacaoDiariaCompleta[] {
  return mockRelacoesDiarias.filter((r) => r.data === data);
}

export function criarRelacaoDiaria(data: CreateRelacaoDiariaData): RelacaoDiariaCompleta {
  const id = uuidv4();
  const now = new Date().toISOString();

  // Criar registros de presença
  const registros: RegistroPresencaRelacao[] = [];

  // Adicionar presentes
  data.colaboradores_presentes.forEach((colaboradorId) => {
    registros.push({
      id: uuidv4(),
      relacao_diaria_id: id,
      colaborador_id: colaboradorId,
      status: 'presente',
      created_at: now,
      updated_at: now,
    });
  });

  // Adicionar ausências
  data.ausencias.forEach((ausencia) => {
    registros.push({
      id: uuidv4(),
      relacao_diaria_id: id,
      colaborador_id: ausencia.colaborador_id,
      status: ausencia.status,
      equipe_destino_id: ausencia.equipe_destino_id,
      observacoes: ausencia.observacoes,
      created_at: now,
      updated_at: now,
    });
  });

  const novaRelacao: RelacaoDiariaCompleta = {
    id,
    data: data.data,
    equipe_id: data.equipe_id,
    total_presentes: data.colaboradores_presentes.length,
    total_ausencias: data.ausencias.length,
    observacoes_dia: data.observacoes_dia,
    created_at: now,
    updated_at: now,
    registros,
  };

  mockRelacoesDiarias.push(novaRelacao);
  console.log('✅ Relação diária criada:', novaRelacao.id);
  return novaRelacao;
}

// ==================== REGISTROS DE DIÁRIAS (PAGAMENTOS) ====================

export function listarRegistrosDiarias(): RegistroDiaria[] {
  return [...mockRegistrosDiarias].sort(
    (a, b) => new Date(b.data_diaria).getTime() - new Date(a.data_diaria).getTime()
  );
}

export function getRegistroDiariaById(id: string): RegistroDiaria | undefined {
  return mockRegistrosDiarias.find((d) => d.id === id);
}

export function getRegistrosDiariasByColaborador(colaboradorId: string): RegistroDiaria[] {
  return mockRegistrosDiarias.filter((d) => d.colaborador_id === colaboradorId);
}

export function criarRegistroDiaria(data: CreateRegistroDiariaData): RegistroDiaria {
  const id = uuidv4();
  const now = new Date().toISOString();

  const adicional = data.adicional || 0;
  const desconto = data.desconto || 0;
  const valorTotal = calcularValorTotalDiaria(
    data.quantidade,
    data.valor_unitario,
    adicional,
    desconto
  );

  const novoRegistro: RegistroDiaria = {
    id,
    colaborador_id: data.colaborador_id,
    quantidade: data.quantidade,
    valor_unitario: data.valor_unitario,
    adicional,
    desconto,
    valor_total: valorTotal,
    data_diaria: data.data_diaria,
    data_pagamento: data.data_pagamento,
    status_pagamento: 'pendente',
    observacoes: data.observacoes,
    relacao_diaria_id: data.relacao_diaria_id,
    created_at: now,
    updated_at: now,
  };

  mockRegistrosDiarias.push(novoRegistro);
  console.log('✅ Registro de diária criado:', novoRegistro.id);
  return novoRegistro;
}

export function atualizarRegistroDiaria(
  id: string,
  updates: Partial<RegistroDiaria>
): RegistroDiaria | undefined {
  const index = mockRegistrosDiarias.findIndex((d) => d.id === id);
  if (index !== -1) {
    mockRegistrosDiarias[index] = {
      ...mockRegistrosDiarias[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return mockRegistrosDiarias[index];
  }
  return undefined;
}

export function deletarRegistroDiaria(id: string): boolean {
  const index = mockRegistrosDiarias.findIndex((d) => d.id === id);
  if (index !== -1) {
    mockRegistrosDiarias.splice(index, 1);
    return true;
  }
  return false;
}

// ==================== RESUMOS E ESTATÍSTICAS ====================

export function getResumoDiariasColaborador(colaboradorId: string): ResumoDiariasColaborador | null {
  const diarias = getRegistrosDiariasByColaborador(colaboradorId);
  if (diarias.length === 0) return null;

  const totalDiarias = diarias.reduce((sum, d) => sum + d.quantidade, 0);
  const valorTotal = diarias.reduce((sum, d) => sum + d.valor_total, 0);
  const diariasPendentes = diarias.filter((d) => d.status_pagamento === 'pendente').length;
  const diariasPagas = diarias.filter((d) => d.status_pagamento === 'pago').length;

  const ultimoPagamento = diarias
    .filter((d) => d.status_pagamento === 'pago' && d.data_pagamento)
    .sort((a, b) => new Date(b.data_pagamento!).getTime() - new Date(a.data_pagamento!).getTime())[0]
    ?.data_pagamento;

  return {
    colaborador_id: colaboradorId,
    colaborador_nome: diarias[0].colaborador_nome || '',
    colaborador_funcao: diarias[0].colaborador_funcao || '',
    total_diarias: totalDiarias,
    valor_total: valorTotal,
    diarias_pendentes: diariasPendentes,
    diarias_pagas: diariasPagas,
    ultimo_pagamento: ultimoPagamento,
  };
}

export function getEstatisticasControleDiario(): EstatisticasControleDiario {
  const totalRelacoes = mockRelacoesDiarias.length;
  const totalPresencas = mockRelacoesDiarias.reduce((sum, r) => sum + r.total_presentes, 0);
  const totalAusencias = mockRelacoesDiarias.reduce((sum, r) => sum + r.total_ausencias, 0);

  const todosRegistros = mockRelacoesDiarias.flatMap((r) => r.registros);
  const totalFaltas = todosRegistros.filter((r) => r.status === 'falta').length;
  const totalAtestados = todosRegistros.filter((r) => r.status === 'atestado').length;
  const totalMudancas = todosRegistros.filter((r) => r.status === 'mudanca_equipe').length;

  const totalDiarias = mockRegistrosDiarias.reduce((sum, d) => sum + d.quantidade, 0);
  const valorTotalDiarias = mockRegistrosDiarias.reduce((sum, d) => sum + d.valor_total, 0);
  const diariasPendentes = mockRegistrosDiarias.filter((d) => d.status_pagamento === 'pendente').length;
  const valorPendente = mockRegistrosDiarias
    .filter((d) => d.status_pagamento === 'pendente')
    .reduce((sum, d) => sum + d.valor_total, 0);

  return {
    totalRelacoes,
    totalPresencas,
    totalAusencias,
    totalFaltas,
    totalAtestados,
    totalMudancas,
    totalDiarias,
    valorTotalDiarias,
    diariasPendentes,
    valorPendente,
  };
}

// Exportar mocks para acesso direto
export { mockRelacoesDiarias, mockRegistrosDiarias };

