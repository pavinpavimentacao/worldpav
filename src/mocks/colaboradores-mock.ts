/**
 * DADOS MOCKADOS - Colaboradores
 * Use este arquivo para testar a interface sem banco de dados
 */

import type { Colaborador } from '../types/colaboradores';

/**
 * Colaboradores da Equipe de Massa (Operacional)
 */
export const mockEquipeMassa: Colaborador[] = [
  // Ajudantes (4)
  {
    id: '1',
    nome: 'João Silva Santos',
    tipo_equipe: 'massa',
    funcao: 'Ajudante',
    tipo_contrato: 'fixo',
    salario_fixo: 2500.00,
    data_pagamento_1: '2025-01-05',
    data_pagamento_2: '2025-01-20',
    valor_pagamento_1: 1250.00,
    valor_pagamento_2: 1250.00,
    equipamento_vinculado_id: null,
    registrado: true,
    vale_transporte: true,
    qtd_passagens_por_dia: 4,
    cpf: '123.456.789-01',
    telefone: '(11) 98765-4321',
    email: 'joao.silva@worldpav.com.br',
    company_id: 'company-1',
    created_at: '2025-01-01T10:00:00Z',
    updated_at: '2025-01-01T10:00:00Z',
  },
  {
    id: '2',
    nome: 'Pedro Oliveira Costa',
    tipo_equipe: 'massa',
    funcao: 'Ajudante',
    tipo_contrato: 'diarista',
    salario_fixo: 150.00,
    data_pagamento_1: null,
    data_pagamento_2: null,
    valor_pagamento_1: null,
    valor_pagamento_2: null,
    equipamento_vinculado_id: null,
    registrado: false,
    vale_transporte: true,
    qtd_passagens_por_dia: 4,
    cpf: '234.567.890-12',
    telefone: '(11) 97654-3210',
    email: 'pedro.oliveira@worldpav.com.br',
    company_id: 'company-1',
    created_at: '2025-01-02T10:00:00Z',
    updated_at: '2025-01-02T10:00:00Z',
  },
  {
    id: '3',
    nome: 'Carlos Eduardo Mendes',
    tipo_equipe: 'massa',
    funcao: 'Ajudante',
    tipo_contrato: 'fixo',
    salario_fixo: 2500.00,
    data_pagamento_1: '2025-01-05',
    data_pagamento_2: '2025-01-20',
    valor_pagamento_1: 1250.00,
    valor_pagamento_2: 1250.00,
    equipamento_vinculado_id: null,
    registrado: true,
    vale_transporte: true,
    qtd_passagens_por_dia: 4,
    cpf: '345.678.901-23',
    telefone: '(11) 96543-2109',
    email: 'carlos.mendes@worldpav.com.br',
    company_id: 'company-1',
    created_at: '2025-01-03T10:00:00Z',
    updated_at: '2025-01-03T10:00:00Z',
  },
  {
    id: '4',
    nome: 'Roberto Alves Lima',
    tipo_equipe: 'massa',
    funcao: 'Ajudante',
    tipo_contrato: 'diarista',
    salario_fixo: 150.00,
    data_pagamento_1: null,
    data_pagamento_2: null,
    valor_pagamento_1: null,
    valor_pagamento_2: null,
    equipamento_vinculado_id: null,
    registrado: false,
    vale_transporte: false,
    qtd_passagens_por_dia: null,
    cpf: '456.789.012-34',
    telefone: '(11) 95432-1098',
    email: null,
    company_id: 'company-1',
    created_at: '2025-01-04T10:00:00Z',
    updated_at: '2025-01-04T10:00:00Z',
  },

  // Rasteleiros (4)
  {
    id: '5',
    nome: 'Antonio Carlos Ferreira',
    tipo_equipe: 'massa',
    funcao: 'Rasteleiro',
    tipo_contrato: 'fixo',
    salario_fixo: 2800.00,
    data_pagamento_1: '2025-01-05',
    data_pagamento_2: '2025-01-20',
    valor_pagamento_1: 1400.00,
    valor_pagamento_2: 1400.00,
    equipamento_vinculado_id: null,
    registrado: true,
    vale_transporte: true,
    qtd_passagens_por_dia: 4,
    cpf: '567.890.123-45',
    telefone: '(11) 94321-0987',
    email: 'antonio.ferreira@worldpav.com.br',
    company_id: 'company-1',
    created_at: '2025-01-05T10:00:00Z',
    updated_at: '2025-01-05T10:00:00Z',
  },
  {
    id: '6',
    nome: 'José Roberto Santos',
    tipo_equipe: 'massa',
    funcao: 'Rasteleiro',
    tipo_contrato: 'fixo',
    salario_fixo: 2800.00,
    data_pagamento_1: '2025-01-05',
    data_pagamento_2: '2025-01-20',
    valor_pagamento_1: 1400.00,
    valor_pagamento_2: 1400.00,
    equipamento_vinculado_id: null,
    registrado: true,
    vale_transporte: true,
    qtd_passagens_por_dia: 4,
    cpf: '678.901.234-56',
    telefone: '(11) 93210-9876',
    email: 'jose.santos@worldpav.com.br',
    company_id: 'company-1',
    created_at: '2025-01-06T10:00:00Z',
    updated_at: '2025-01-06T10:00:00Z',
  },
  {
    id: '7',
    nome: 'Francisco Silva Souza',
    tipo_equipe: 'massa',
    funcao: 'Rasteleiro',
    tipo_contrato: 'diarista',
    salario_fixo: 180.00,
    data_pagamento_1: null,
    data_pagamento_2: null,
    valor_pagamento_1: null,
    valor_pagamento_2: null,
    equipamento_vinculado_id: null,
    registrado: false,
    vale_transporte: true,
    qtd_passagens_por_dia: 4,
    cpf: '789.012.345-67',
    telefone: '(11) 92109-8765',
    email: null,
    company_id: 'company-1',
    created_at: '2025-01-07T10:00:00Z',
    updated_at: '2025-01-07T10:00:00Z',
  },
  {
    id: '8',
    nome: 'Marcos Paulo Dias',
    tipo_equipe: 'massa',
    funcao: 'Rasteleiro',
    tipo_contrato: 'fixo',
    salario_fixo: 2800.00,
    data_pagamento_1: '2025-01-05',
    data_pagamento_2: '2025-01-20',
    valor_pagamento_1: 1400.00,
    valor_pagamento_2: 1400.00,
    equipamento_vinculado_id: null,
    registrado: true,
    vale_transporte: true,
    qtd_passagens_por_dia: 4,
    cpf: '890.123.456-78',
    telefone: '(11) 91098-7654',
    email: 'marcos.dias@worldpav.com.br',
    company_id: 'company-1',
    created_at: '2025-01-08T10:00:00Z',
    updated_at: '2025-01-08T10:00:00Z',
  },

  // Operadores de Rolo
  {
    id: '9',
    nome: 'Ricardo Henrique Machado',
    tipo_equipe: 'massa',
    funcao: 'Operador de Rolo Chapa Chapa',
    tipo_contrato: 'fixo',
    salario_fixo: 3500.00,
    data_pagamento_1: '2025-01-05',
    data_pagamento_2: '2025-01-20',
    valor_pagamento_1: 1750.00,
    valor_pagamento_2: 1750.00,
    equipamento_vinculado_id: 'equip-1',
    registrado: true,
    vale_transporte: true,
    qtd_passagens_por_dia: 4,
    cpf: '901.234.567-89',
    telefone: '(11) 90987-6543',
    email: 'ricardo.machado@worldpav.com.br',
    company_id: 'company-1',
    created_at: '2025-01-09T10:00:00Z',
    updated_at: '2025-01-09T10:00:00Z',
  },
  {
    id: '10',
    nome: 'Luiz Fernando Rocha',
    tipo_equipe: 'massa',
    funcao: 'Operador de Rolo Pneu Pneu',
    tipo_contrato: 'fixo',
    salario_fixo: 3500.00,
    data_pagamento_1: '2025-01-05',
    data_pagamento_2: '2025-01-20',
    valor_pagamento_1: 1750.00,
    valor_pagamento_2: 1750.00,
    equipamento_vinculado_id: 'equip-2',
    registrado: true,
    vale_transporte: true,
    qtd_passagens_por_dia: 4,
    cpf: '012.345.678-90',
    telefone: '(11) 89876-5432',
    email: 'luiz.rocha@worldpav.com.br',
    company_id: 'company-1',
    created_at: '2025-01-10T10:00:00Z',
    updated_at: '2025-01-10T10:00:00Z',
  },

  // Operador de VibroAcabadora
  {
    id: '11',
    nome: 'Sergio Augusto Barros',
    tipo_equipe: 'massa',
    funcao: 'Operador de VibroAcabadora',
    tipo_contrato: 'fixo',
    salario_fixo: 4000.00,
    data_pagamento_1: '2025-01-05',
    data_pagamento_2: '2025-01-20',
    valor_pagamento_1: 2000.00,
    valor_pagamento_2: 2000.00,
    equipamento_vinculado_id: 'equip-3',
    registrado: true,
    vale_transporte: true,
    qtd_passagens_por_dia: 4,
    cpf: '123.456.789-02',
    telefone: '(11) 88765-4321',
    email: 'sergio.barros@worldpav.com.br',
    company_id: 'company-1',
    created_at: '2025-01-11T10:00:00Z',
    updated_at: '2025-01-11T10:00:00Z',
  },

  // Operador de Mesa
  {
    id: '12',
    nome: 'Paulo Henrique Almeida',
    tipo_equipe: 'massa',
    funcao: 'Operador de Mesa da VibroAcabadora',
    tipo_contrato: 'fixo',
    salario_fixo: 3200.00,
    data_pagamento_1: '2025-01-05',
    data_pagamento_2: '2025-01-20',
    valor_pagamento_1: 1600.00,
    valor_pagamento_2: 1600.00,
    equipamento_vinculado_id: 'equip-3',
    registrado: true,
    vale_transporte: true,
    qtd_passagens_por_dia: 4,
    cpf: '234.567.890-13',
    telefone: '(11) 87654-3210',
    email: 'paulo.almeida@worldpav.com.br',
    company_id: 'company-1',
    created_at: '2025-01-12T10:00:00Z',
    updated_at: '2025-01-12T10:00:00Z',
  },

  // Motorista
  {
    id: '13',
    nome: 'Wagner Luiz Pereira',
    tipo_equipe: 'massa',
    funcao: 'Motorista de Caminhão Espargidor',
    tipo_contrato: 'fixo',
    salario_fixo: 3800.00,
    data_pagamento_1: '2025-01-05',
    data_pagamento_2: '2025-01-20',
    valor_pagamento_1: 1900.00,
    valor_pagamento_2: 1900.00,
    equipamento_vinculado_id: 'equip-4',
    registrado: true,
    vale_transporte: false,
    qtd_passagens_por_dia: null,
    cpf: '345.678.901-24',
    telefone: '(11) 86543-2109',
    email: 'wagner.pereira@worldpav.com.br',
    company_id: 'company-1',
    created_at: '2025-01-13T10:00:00Z',
    updated_at: '2025-01-13T10:00:00Z',
  },

  // Mangueirista
  {
    id: '14',
    nome: 'Anderson Silva Campos',
    tipo_equipe: 'massa',
    funcao: 'Mangueirista',
    tipo_contrato: 'fixo',
    salario_fixo: 2700.00,
    data_pagamento_1: '2025-01-05',
    data_pagamento_2: '2025-01-20',
    valor_pagamento_1: 1350.00,
    valor_pagamento_2: 1350.00,
    equipamento_vinculado_id: null,
    registrado: true,
    vale_transporte: true,
    qtd_passagens_por_dia: 4,
    cpf: '456.789.012-35',
    telefone: '(11) 85432-1098',
    email: 'anderson.campos@worldpav.com.br',
    company_id: 'company-1',
    created_at: '2025-01-14T10:00:00Z',
    updated_at: '2025-01-14T10:00:00Z',
  },

  // Encarregado
  {
    id: '15',
    nome: 'Fernando Cesar Ribeiro',
    tipo_equipe: 'massa',
    funcao: 'Encarregado',
    tipo_contrato: 'fixo',
    salario_fixo: 4500.00,
    data_pagamento_1: '2025-01-05',
    data_pagamento_2: '2025-01-20',
    valor_pagamento_1: 2250.00,
    valor_pagamento_2: 2250.00,
    equipamento_vinculado_id: null,
    registrado: true,
    vale_transporte: false,
    qtd_passagens_por_dia: null,
    cpf: '567.890.123-46',
    telefone: '(11) 84321-0987',
    email: 'fernando.ribeiro@worldpav.com.br',
    company_id: 'company-1',
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z',
  },
];

/**
 * Colaboradores da Equipe Administrativa
 */
export const mockEquipeAdministrativa: Colaborador[] = [
  // Financeiro
  {
    id: '16',
    nome: 'Maria Fernanda Santos',
    tipo_equipe: 'administrativa',
    funcao: 'Financeiro',
    tipo_contrato: 'fixo',
    salario_fixo: 5000.00,
    data_pagamento_1: '2025-01-05',
    data_pagamento_2: '2025-01-20',
    valor_pagamento_1: 2500.00,
    valor_pagamento_2: 2500.00,
    equipamento_vinculado_id: null,
    registrado: true,
    vale_transporte: false,
    qtd_passagens_por_dia: null,
    cpf: '678.901.234-57',
    telefone: '(11) 98765-1234',
    email: 'maria.santos@worldpav.com.br',
    company_id: 'company-1',
    created_at: '2025-01-16T10:00:00Z',
    updated_at: '2025-01-16T10:00:00Z',
  },

  // RH
  {
    id: '17',
    nome: 'Ana Paula Oliveira',
    tipo_equipe: 'administrativa',
    funcao: 'RH',
    tipo_contrato: 'fixo',
    salario_fixo: 4500.00,
    data_pagamento_1: '2025-01-05',
    data_pagamento_2: '2025-01-20',
    valor_pagamento_1: 2250.00,
    valor_pagamento_2: 2250.00,
    equipamento_vinculado_id: null,
    registrado: true,
    vale_transporte: false,
    qtd_passagens_por_dia: null,
    cpf: '789.012.345-68',
    telefone: '(11) 97654-1234',
    email: 'ana.oliveira@worldpav.com.br',
    company_id: 'company-1',
    created_at: '2025-01-17T10:00:00Z',
    updated_at: '2025-01-17T10:00:00Z',
  },

  // Programador
  {
    id: '18',
    nome: 'Rafael Costa Lima',
    tipo_equipe: 'administrativa',
    funcao: 'Programador',
    tipo_contrato: 'fixo',
    salario_fixo: 4000.00,
    data_pagamento_1: '2025-01-05',
    data_pagamento_2: '2025-01-20',
    valor_pagamento_1: 2000.00,
    valor_pagamento_2: 2000.00,
    equipamento_vinculado_id: null,
    registrado: true,
    vale_transporte: true,
    qtd_passagens_por_dia: 2,
    cpf: '890.123.456-79',
    telefone: '(11) 96543-1234',
    email: 'rafael.lima@worldpav.com.br',
    company_id: 'company-1',
    created_at: '2025-01-18T10:00:00Z',
    updated_at: '2025-01-18T10:00:00Z',
  },

  // Admin
  {
    id: '19',
    nome: 'Juliana Rodrigues Silva',
    tipo_equipe: 'administrativa',
    funcao: 'Admin',
    tipo_contrato: 'fixo',
    salario_fixo: 6000.00,
    data_pagamento_1: '2025-01-05',
    data_pagamento_2: '2025-01-20',
    valor_pagamento_1: 3000.00,
    valor_pagamento_2: 3000.00,
    equipamento_vinculado_id: null,
    registrado: true,
    vale_transporte: false,
    qtd_passagens_por_dia: null,
    cpf: '901.234.567-80',
    telefone: '(11) 95432-1234',
    email: 'juliana.silva@worldpav.com.br',
    company_id: 'company-1',
    created_at: '2025-01-19T10:00:00Z',
    updated_at: '2025-01-19T10:00:00Z',
  },
];

/**
 * Todos os colaboradores (Massa + Administrativa)
 */
export const mockColaboradores: Colaborador[] = [
  ...mockEquipeMassa,
  ...mockEquipeAdministrativa,
];

/**
 * Estatísticas dos mocks
 */
export const mockColaboradoresStats = {
  total: mockColaboradores.length,
  equipeMassa: mockEquipeMassa.length,
  equipeAdministrativa: mockEquipeAdministrativa.length,
  registrados: mockColaboradores.filter(c => c.registrado).length,
  naoRegistrados: mockColaboradores.filter(c => !c.registrado).length,
  contratoFixo: mockColaboradores.filter(c => c.tipo_contrato === 'fixo').length,
  diaristas: mockColaboradores.filter(c => c.tipo_contrato === 'diarista').length,
  comValeTransporte: mockColaboradores.filter(c => c.vale_transporte).length,
};

/**
 * Helper: Buscar colaborador por ID
 */
export function getColaboradorById(id: string): Colaborador | undefined {
  return mockColaboradores.find(c => c.id === id);
}

/**
 * Helper: Filtrar colaboradores por tipo de equipe
 */
export function getColaboradoresByTipoEquipe(tipo: 'massa' | 'administrativa'): Colaborador[] {
  return mockColaboradores.filter(c => c.tipo_equipe === tipo);
}

/**
 * Helper: Filtrar colaboradores por função
 */
export function getColaboradoresByFuncao(funcao: string): Colaborador[] {
  return mockColaboradores.filter(c => c.funcao === funcao);
}

/**
 * Helper: Buscar colaboradores por termo
 */
export function searchColaboradores(searchTerm: string): Colaborador[] {
  const term = searchTerm.toLowerCase();
  return mockColaboradores.filter(c =>
    c.nome.toLowerCase().includes(term) ||
    c.funcao.toLowerCase().includes(term) ||
    c.email?.toLowerCase().includes(term) ||
    c.cpf?.toLowerCase().includes(term)
  );
}


