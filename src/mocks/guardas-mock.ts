/**
 * MOCK - Sistema de Guardas
 * Dados temporários para desenvolvimento
 * 
 * TODO: Substituir por API real (guardasApi.ts)
 */

import {
  EmpresaGuarda,
  Guarda,
  DiariaGuardaCompleta,
  DiariaMaquinario,
  CreateEmpresaGuardaInput,
  CreateGuardaInput,
  TurnoGuarda,
} from '../types/guardas';

// ============================================
// EMPRESAS DE GUARDA
// ============================================

export const mockEmpresasGuarda: EmpresaGuarda[] = [
  {
    id: 'emp-guarda-001',
    nome: 'Segurança Total Ltda',
    telefone: '(11) 98765-4321',
    documento: '12345678000190',
    tipo_documento: 'CNPJ',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    deleted_at: null,
  },
  {
    id: 'emp-guarda-002',
    nome: 'Vigilância 24h',
    telefone: '(11) 97654-3210',
    documento: '98765432000100',
    tipo_documento: 'CNPJ',
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z',
    deleted_at: null,
  },
  {
    id: 'emp-guarda-003',
    nome: 'João Silva (Autônomo)',
    telefone: '(11) 96543-2109',
    documento: '12345678901',
    tipo_documento: 'CPF',
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-02-01T10:00:00Z',
    deleted_at: null,
  },
];

// ============================================
// GUARDAS
// ============================================

export const mockGuardas: Guarda[] = [
  {
    id: 'guarda-001',
    nome: 'Carlos Eduardo Silva',
    telefone: '(11) 99876-5432',
    company_id: 'emp-guarda-001',
    empresa_nome: 'Segurança Total Ltda',
    ativo: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'guarda-002',
    nome: 'Maria Santos',
    telefone: '(11) 98765-4321',
    company_id: 'emp-guarda-001',
    empresa_nome: 'Segurança Total Ltda',
    ativo: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'guarda-003',
    nome: 'Pedro Oliveira',
    telefone: '(11) 97654-3210',
    company_id: 'emp-guarda-002',
    empresa_nome: 'Vigilância 24h',
    ativo: true,
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z',
  },
  {
    id: 'guarda-004',
    nome: 'Ana Paula Costa',
    telefone: '(11) 96543-2109',
    company_id: 'emp-guarda-002',
    empresa_nome: 'Vigilância 24h',
    ativo: true,
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z',
  },
  {
    id: 'guarda-005',
    nome: 'João Silva',
    telefone: '(11) 96543-2109',
    company_id: 'emp-guarda-003',
    empresa_nome: 'João Silva (Autônomo)',
    ativo: true,
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-02-01T10:00:00Z',
  },
];

// ============================================
// DIÁRIAS DE GUARDA
// ============================================

export const mockDiariasGuarda: DiariaGuardaCompleta[] = [
  {
    id: 'diaria-001',
    guarda_id: 'guarda-001',
    guarda_nome: 'Carlos Eduardo Silva',
    company_id: 'emp-guarda-001',
    empresa_nome: 'Segurança Total Ltda',
    solicitante: 'João Gerente',
    valor_diaria: 250.00,
    data_diaria: '2024-11-01',
    turno: 'noite',
    rua: 'Rua das Flores, 123',
    foto_maquinario_url: 'https://placehold.co/600x400/png?text=Maquinario+1',
    observacoes: 'Diária tranquila, sem intercorrências',
    created_at: '2024-11-01T18:00:00Z',
    updated_at: '2024-11-01T18:00:00Z',
    maquinarios: [
      {
        id: 'diaria-maq-001',
        diaria_id: 'diaria-001',
        maquinario_id: 'maq-001',
        maquinario_nome: 'Vibroacabadora CAT AP1055F',
        created_at: '2024-11-01T18:00:00Z',
      },
      {
        id: 'diaria-maq-002',
        diaria_id: 'diaria-001',
        maquinario_id: 'maq-002',
        maquinario_nome: 'Rolo Compactador BOMAG BW213',
        created_at: '2024-11-01T18:00:00Z',
      },
    ],
  },
  {
    id: 'diaria-002',
    guarda_id: 'guarda-002',
    guarda_nome: 'Maria Santos',
    company_id: 'emp-guarda-001',
    empresa_nome: 'Segurança Total Ltda',
    solicitante: 'Pedro Supervisor',
    valor_diaria: 300.00,
    data_diaria: '2024-11-02',
    turno: 'madrugada',
    rua: 'Av. Paulista, 1000',
    observacoes: undefined,
    created_at: '2024-11-02T02:00:00Z',
    updated_at: '2024-11-02T02:00:00Z',
    maquinarios: [
      {
        id: 'diaria-maq-003',
        diaria_id: 'diaria-002',
        maquinario_id: 'maq-003',
        maquinario_nome: 'Caminhão Basculante Mercedes 2729',
        created_at: '2024-11-02T02:00:00Z',
      },
    ],
  },
  {
    id: 'diaria-003',
    guarda_id: 'guarda-003',
    guarda_nome: 'Pedro Oliveira',
    company_id: 'emp-guarda-002',
    empresa_nome: 'Vigilância 24h',
    solicitante: 'Carlos Coordenador',
    valor_diaria: 280.00,
    data_diaria: '2024-11-02',
    turno: 'noite',
    rua: 'Rua Augusta, 500',
    foto_maquinario_url: 'https://placehold.co/600x400/png?text=Maquinario+3',
    created_at: '2024-11-02T19:00:00Z',
    updated_at: '2024-11-02T19:00:00Z',
    maquinarios: [
      {
        id: 'diaria-maq-004',
        diaria_id: 'diaria-003',
        maquinario_id: 'maq-004',
        maquinario_nome: 'Escavadeira Hidráulica CAT 320D',
        created_at: '2024-11-02T19:00:00Z',
      },
      {
        id: 'diaria-maq-005',
        diaria_id: 'diaria-003',
        maquinario_id: 'maq-005',
        maquinario_nome: 'Caminhão Espargidor Volvo FM 370',
        created_at: '2024-11-02T19:00:00Z',
      },
    ],
  },
  {
    id: 'diaria-004',
    guarda_id: 'guarda-004',
    guarda_nome: 'Ana Paula Costa',
    company_id: 'emp-guarda-002',
    empresa_nome: 'Vigilância 24h',
    solicitante: 'Maria Gerente',
    valor_diaria: 250.00,
    data_diaria: '2024-11-03',
    turno: 'tarde',
    rua: 'Rua dos Pinheiros, 789',
    created_at: '2024-11-03T14:00:00Z',
    updated_at: '2024-11-03T14:00:00Z',
    maquinarios: [
      {
        id: 'diaria-maq-006',
        diaria_id: 'diaria-004',
        maquinario_id: 'maq-001',
        maquinario_nome: 'Vibroacabadora CAT AP1055F',
        created_at: '2024-11-03T14:00:00Z',
      },
    ],
  },
];

// ============================================
// FUNÇÕES DE MANIPULAÇÃO
// ============================================

/**
 * Adiciona uma nova empresa de guarda
 */
export function adicionarEmpresaGuarda(input: CreateEmpresaGuardaInput): EmpresaGuarda {
  const novaEmpresa: EmpresaGuarda = {
    id: `emp-guarda-${Date.now()}`,
    nome: input.nome,
    telefone: input.telefone,
    documento: input.documento,
    tipo_documento: input.tipo_documento,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
  };
  mockEmpresasGuarda.push(novaEmpresa);
  return novaEmpresa;
}

/**
 * Adiciona um novo guarda
 */
export function adicionarGuarda(input: CreateGuardaInput): Guarda {
  const empresa = mockEmpresasGuarda.find((e) => e.id === input.empresa_id);
  
  const novoGuarda: Guarda = {
    id: `guarda-${Date.now()}`,
    nome: input.nome,
    telefone: input.telefone,
    company_id: input.empresa_id,
    empresa_nome: empresa?.nome,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
  };
  mockGuardas.push(novoGuarda);
  return novoGuarda;
}

/**
 * Adiciona uma nova diária de guarda
 */
export function adicionarDiariaGuarda(input: {
  guarda_id: string;
  solicitante: string;
  valor_diaria: number;
  data_diaria: string;
  turno: TurnoGuarda;
  rua: string;
  maquinarios_ids: string[];
  foto_maquinario_url?: string;
  observacoes?: string;
}): DiariaGuardaCompleta {
  const guarda = mockGuardas.find((g) => g.id === input.guarda_id);
  const empresa = mockEmpresasGuarda.find((e) => e.id === guarda?.company_id);

  const diariaId = `diaria-${Date.now()}`;

  const maquinarios: DiariaMaquinario[] = input.maquinarios_ids.map((maqId, index) => ({
    id: `diaria-maq-${Date.now()}-${index}`,
    diaria_id: diariaId,
    maquinario_id: maqId,
    maquinario_nome: `Maquinário ${maqId}`, // Mock - buscar nome real
    created_at: new Date().toISOString(),
  }));

  const novaDiaria: DiariaGuardaCompleta = {
    id: diariaId,
    guarda_id: input.guarda_id,
    guarda_nome: guarda?.nome,
    company_id: guarda?.company_id || '',
    empresa_nome: empresa?.nome,
    solicitante: input.solicitante,
    valor_diaria: input.valor_diaria,
    data_diaria: input.data_diaria,
    turno: input.turno,
    rua: input.rua,
    foto_maquinario_url: input.foto_maquinario_url,
    observacoes: input.observacoes,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    maquinarios,
  };

  mockDiariasGuarda.push(novaDiaria);
  return novaDiaria;
}

/**
 * Retorna estatísticas das diárias
 */
export function getEstatisticasGuardas() {
  const totalDiarias = mockDiariasGuarda.length;
  const valorTotal = mockDiariasGuarda.reduce((acc, d) => acc + (d.valor_diaria || 0), 0);
  const valorMedio = totalDiarias > 0 ? valorTotal / totalDiarias : 0;

  return {
    totalEmpresas: mockEmpresasGuarda.filter((e) => !e.deleted_at).length,
    totalGuardas: mockGuardas.filter((g) => !g.deleted_at).length,
    totalDiarias,
    valorTotal,
    valorMedio,
  };
}
