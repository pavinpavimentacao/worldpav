/**
 * DADOS MOCKADOS - Sistema de Guardas
 */

import type {
  EmpresaGuarda,
  Guarda,
  DiariaGuardaCompleta,
  DiariaMaquinario,
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
    ativo: true,
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z',
  },
  {
    id: 'emp-guarda-002',
    nome: 'Vigilância 24h',
    telefone: '(11) 97654-3210',
    documento: '98765432000111',
    tipo_documento: 'CNPJ',
    ativo: true,
    created_at: '2025-02-10T14:30:00Z',
    updated_at: '2025-02-10T14:30:00Z',
  },
  {
    id: 'emp-guarda-003',
    nome: 'João Silva Segurança ME',
    telefone: '(11) 96543-2109',
    documento: '12345678901',
    tipo_documento: 'CPF',
    ativo: true,
    created_at: '2025-03-05T09:15:00Z',
    updated_at: '2025-03-05T09:15:00Z',
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
    empresa_id: 'emp-guarda-001',
    empresa_nome: 'Segurança Total Ltda',
    ativo: true,
    created_at: '2025-01-16T08:00:00Z',
    updated_at: '2025-01-16T08:00:00Z',
  },
  {
    id: 'guarda-002',
    nome: 'Roberto Santos',
    telefone: '(11) 98765-4321',
    empresa_id: 'emp-guarda-001',
    empresa_nome: 'Segurança Total Ltda',
    ativo: true,
    created_at: '2025-01-20T10:30:00Z',
    updated_at: '2025-01-20T10:30:00Z',
  },
  {
    id: 'guarda-003',
    nome: 'José Oliveira',
    telefone: '(11) 97654-3210',
    empresa_id: 'emp-guarda-002',
    empresa_nome: 'Vigilância 24h',
    ativo: true,
    created_at: '2025-02-11T09:00:00Z',
    updated_at: '2025-02-11T09:00:00Z',
  },
  {
    id: 'guarda-004',
    nome: 'Maria Santos',
    telefone: '(11) 96543-2109',
    empresa_id: 'emp-guarda-002',
    empresa_nome: 'Vigilância 24h',
    ativo: true,
    created_at: '2025-02-15T11:00:00Z',
    updated_at: '2025-02-15T11:00:00Z',
  },
  {
    id: 'guarda-005',
    nome: 'Pedro Costa',
    telefone: '(11) 95432-1098',
    empresa_id: 'emp-guarda-003',
    empresa_nome: 'João Silva Segurança ME',
    ativo: true,
    created_at: '2025-03-06T14:00:00Z',
    updated_at: '2025-03-06T14:00:00Z',
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
    empresa_id: 'emp-guarda-001',
    empresa_nome: 'Segurança Total Ltda',
    solicitante: 'João Gerente',
    valor_diaria: 250.0,
    data_diaria: '2025-10-15',
    turno: 'noite',
    rua: 'Rua das Flores',
    foto_maquinario_url: 'https://placehold.co/600x400/png?text=Foto+Maquinario',
    observacoes: 'Guarda para vibroacabadora',
    created_at: '2025-10-15T18:00:00Z',
    updated_at: '2025-10-15T18:00:00Z',
    maquinarios: [
      {
        id: 'diaria-maq-001',
        diaria_id: 'diaria-001',
        maquinario_id: 'maq-001',
        maquinario_nome: 'Vibroacabadora CAT AP1055F',
        created_at: '2025-10-15T18:00:00Z',
      },
    ],
  },
  {
    id: 'diaria-002',
    guarda_id: 'guarda-002',
    guarda_nome: 'Roberto Santos',
    empresa_id: 'emp-guarda-001',
    empresa_nome: 'Segurança Total Ltda',
    solicitante: 'Maria Coordenadora',
    valor_diaria: 280.0,
    data_diaria: '2025-10-16',
    turno: 'madrugada',
    rua: 'Avenida Central',
    observacoes: 'Guarda para rolo compactador e caminhão',
    created_at: '2025-10-16T02:00:00Z',
    updated_at: '2025-10-16T02:00:00Z',
    maquinarios: [
      {
        id: 'diaria-maq-002',
        diaria_id: 'diaria-002',
        maquinario_id: 'maq-002',
        maquinario_nome: 'Rolo Compactador BOMAG BW213',
        created_at: '2025-10-16T02:00:00Z',
      },
      {
        id: 'diaria-maq-003',
        diaria_id: 'diaria-002',
        maquinario_id: 'maq-003',
        maquinario_nome: 'Caminhão Basculante Mercedes 2729',
        created_at: '2025-10-16T02:00:00Z',
      },
    ],
  },
  {
    id: 'diaria-003',
    guarda_id: 'guarda-003',
    guarda_nome: 'José Oliveira',
    empresa_id: 'emp-guarda-002',
    empresa_nome: 'Vigilância 24h',
    solicitante: 'Pedro Supervisor',
    valor_diaria: 260.0,
    data_diaria: '2025-10-17',
    turno: 'tarde',
    rua: 'Rua São Paulo',
    created_at: '2025-10-17T14:00:00Z',
    updated_at: '2025-10-17T14:00:00Z',
    maquinarios: [
      {
        id: 'diaria-maq-004',
        diaria_id: 'diaria-003',
        maquinario_id: 'maq-004',
        maquinario_nome: 'Escavadeira Hidráulica CAT 320D',
        created_at: '2025-10-17T14:00:00Z',
      },
    ],
  },
  {
    id: 'diaria-004',
    guarda_id: 'guarda-004',
    guarda_nome: 'Maria Santos',
    empresa_id: 'emp-guarda-002',
    empresa_nome: 'Vigilância 24h',
    solicitante: 'Ana Gerente',
    valor_diaria: 240.0,
    data_diaria: '2025-10-18',
    turno: 'manha',
    rua: 'Rua das Acácias',
    foto_maquinario_url: 'https://placehold.co/600x400/png?text=Foto+Maquinario+2',
    created_at: '2025-10-18T07:00:00Z',
    updated_at: '2025-10-18T07:00:00Z',
    maquinarios: [
      {
        id: 'diaria-maq-005',
        diaria_id: 'diaria-004',
        maquinario_id: 'maq-001',
        maquinario_nome: 'Vibroacabadora CAT AP1055F',
        created_at: '2025-10-18T07:00:00Z',
      },
      {
        id: 'diaria-maq-006',
        diaria_id: 'diaria-004',
        maquinario_id: 'maq-002',
        maquinario_nome: 'Rolo Compactador BOMAG BW213',
        created_at: '2025-10-18T07:00:00Z',
      },
    ],
  },
];

// ============================================
// HELPERS
// ============================================

/**
 * Buscar empresa por ID
 */
export function getEmpresaGuardaById(id: string): EmpresaGuarda | undefined {
  return mockEmpresasGuarda.find((e) => e.id === id);
}

/**
 * Buscar guarda por ID
 */
export function getGuardaById(id: string): Guarda | undefined {
  return mockGuardas.find((g) => g.id === id);
}

/**
 * Buscar guardas por empresa
 */
export function getGuardasByEmpresa(empresaId: string): Guarda[] {
  return mockGuardas.filter((g) => g.empresa_id === empresaId);
}

/**
 * Buscar diária por ID
 */
export function getDiariaGuardaById(id: string): DiariaGuardaCompleta | undefined {
  return mockDiariasGuarda.find((d) => d.id === id);
}

/**
 * Buscar diárias por guarda
 */
export function getDiariasByGuarda(guardaId: string): DiariaGuardaCompleta[] {
  return mockDiariasGuarda.filter((d) => d.guarda_id === guardaId);
}

/**
 * Buscar diárias por período
 */
export function getDiariasByPeriodo(
  dataInicio: string,
  dataFim: string
): DiariaGuardaCompleta[] {
  return mockDiariasGuarda.filter(
    (d) => d.data_diaria >= dataInicio && d.data_diaria <= dataFim
  );
}

/**
 * Adicionar nova empresa de guarda
 */
export function adicionarEmpresaGuarda(
  dados: Omit<EmpresaGuarda, 'id' | 'created_at' | 'updated_at' | 'ativo'>
): EmpresaGuarda {
  const novaEmpresa: EmpresaGuarda = {
    ...dados,
    id: `emp-guarda-${Date.now()}`,
    ativo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  mockEmpresasGuarda.push(novaEmpresa);
  return novaEmpresa;
}

/**
 * Adicionar novo guarda
 */
export function adicionarGuarda(
  dados: Omit<Guarda, 'id' | 'created_at' | 'updated_at' | 'ativo' | 'empresa_nome'>
): Guarda {
  const empresa = getEmpresaGuardaById(dados.empresa_id);
  const novoGuarda: Guarda = {
    ...dados,
    id: `guarda-${Date.now()}`,
    empresa_nome: empresa?.nome,
    ativo: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  mockGuardas.push(novoGuarda);
  return novoGuarda;
}

/**
 * Adicionar nova diária de guarda
 */
export function adicionarDiariaGuarda(
  dados: {
    guarda_id: string;
    solicitante: string;
    valor_diaria: number;
    data_diaria: string;
    turno: 'manha' | 'tarde' | 'noite' | 'madrugada';
    rua: string;
    maquinarios_ids: string[];
    foto_maquinario_url?: string;
    observacoes?: string;
  }
): DiariaGuardaCompleta {
  const guarda = getGuardaById(dados.guarda_id);
  const empresa = guarda ? getEmpresaGuardaById(guarda.empresa_id) : undefined;

  const novaDiaria: DiariaGuardaCompleta = {
    id: `diaria-${Date.now()}`,
    guarda_id: dados.guarda_id,
    guarda_nome: guarda?.nome,
    empresa_id: guarda?.empresa_id || '',
    empresa_nome: empresa?.nome,
    solicitante: dados.solicitante,
    valor_diaria: dados.valor_diaria,
    data_diaria: dados.data_diaria,
    turno: dados.turno,
    rua: dados.rua,
    foto_maquinario_url: dados.foto_maquinario_url,
    observacoes: dados.observacoes,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    maquinarios: dados.maquinarios_ids.map((maqId) => ({
      id: `diaria-maq-${Date.now()}-${Math.random()}`,
      diaria_id: `diaria-${Date.now()}`,
      maquinario_id: maqId,
      maquinario_nome: `Maquinário ${maqId}`, // Aqui você pode buscar o nome real
      created_at: new Date().toISOString(),
    })),
  };

  mockDiariasGuarda.push(novaDiaria);
  console.log('✅ Diária de guarda adicionada:', novaDiaria);
  return novaDiaria;
}

/**
 * Estatísticas
 */
export function getEstatisticasGuardas() {
  const totalEmpresas = mockEmpresasGuarda.filter((e) => e.ativo).length;
  const totalGuardas = mockGuardas.filter((g) => g.ativo).length;
  const totalDiarias = mockDiariasGuarda.length;
  const valorTotal = mockDiariasGuarda.reduce((acc, d) => acc + d.valor_diaria, 0);
  const valorMedio = totalDiarias > 0 ? valorTotal / totalDiarias : 0;

  return {
    totalEmpresas,
    totalGuardas,
    totalDiarias,
    valorTotal,
    valorMedio,
  };
}


