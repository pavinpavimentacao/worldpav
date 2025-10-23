/**
 * DADOS MOCKADOS - Seguro de Maquinários e Veículos
 */

import type { SeguroMaquinario, SinistroSeguro } from '../types/maquinarios-seguro';

/**
 * Seguros mockados para diferentes maquinários
 */
export const mockSeguros: SeguroMaquinario[] = [
  // Vibroacabadora CAT AP1055F
  {
    id: 'seg-1',
    maquinario_id: '1',
    seguradora: 'Porto Seguro',
    numero_apolice: 'PS-2024-001234',
    tipo_cobertura: 'compreensiva',
    valor_segurado: 450000,
    valor_franquia: 5000,
    data_inicio_vigencia: '2024-01-15',
    data_fim_vigencia: '2025-01-14',
    forma_pagamento: 'parcelado_mensal',
    valor_premio: 18000,
    valor_parcela: 1500,
    quantidade_parcelas: 12,
    dia_vencimento: 15,
    observacoes: 'Cobertura completa incluindo roubo, incêndio e colisão. Equipamento de alto valor.',
    corretor: 'Marcos Seguros Ltda',
    telefone_corretor: '(11) 98765-4321',
    email_corretor: 'marcos@marcosseguros.com.br',
    arquivo_apolice_url: 'https://exemplo.com/seguros/apolice-vibroacabadora.pdf',
    status: 'ativo',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z',
  },
  
  // Espargidor de Emulsão Volvo FMX
  {
    id: 'seg-2',
    maquinario_id: '2',
    seguradora: 'Bradesco Seguros',
    numero_apolice: 'BRA-2024-005678',
    tipo_cobertura: 'compreensiva',
    valor_segurado: 380000,
    valor_franquia: 4500,
    data_inicio_vigencia: '2024-02-01',
    data_fim_vigencia: '2025-01-31',
    forma_pagamento: 'parcelado_mensal',
    valor_premio: 15200,
    valor_parcela: 1266.67,
    quantidade_parcelas: 12,
    dia_vencimento: 10,
    observacoes: 'Seguro específico para caminhão espargidor. Inclui cobertura para sistema de emulsão.',
    corretor: 'Silva Corretora de Seguros',
    telefone_corretor: '(11) 97654-3210',
    email_corretor: 'contato@silvacorretora.com.br',
    arquivo_apolice_url: 'https://exemplo.com/seguros/apolice-espargidor.pdf',
    status: 'ativo',
    created_at: '2024-01-25T10:00:00Z',
    updated_at: '2024-01-25T10:00:00Z',
  },

  // Rolo Compactador Chapa Dynapac CA2500
  {
    id: 'seg-3',
    maquinario_id: '3',
    seguradora: 'Itaú Seguros',
    numero_apolice: 'ITA-2024-009876',
    tipo_cobertura: 'incendio_roubo',
    valor_segurado: 180000,
    valor_franquia: 3000,
    data_inicio_vigencia: '2023-12-01',
    data_fim_vigencia: '2024-11-30',
    forma_pagamento: 'vista',
    valor_premio: 7200,
    observacoes: 'Seguro renovável. Cobertura básica de incêndio e roubo.',
    corretor: 'João Seguros e Consultoria',
    telefone_corretor: '(11) 96543-2109',
    email_corretor: 'joao@joaoseguros.com.br',
    arquivo_apolice_url: 'https://exemplo.com/seguros/apolice-rolo-chapa.pdf',
    status: 'ativo',
    created_at: '2023-11-20T10:00:00Z',
    updated_at: '2023-11-20T10:00:00Z',
  },

  // Rolo Pneumático Bomag BW213 - Vencido (precisa renovar)
  {
    id: 'seg-4',
    maquinario_id: '4',
    seguradora: 'Allianz Seguros',
    numero_apolice: 'ALL-2023-002345',
    tipo_cobertura: 'compreensiva',
    valor_segurado: 220000,
    valor_franquia: 3500,
    data_inicio_vigencia: '2023-06-01',
    data_fim_vigencia: '2024-05-31',
    forma_pagamento: 'parcelado_trimestral',
    valor_premio: 8800,
    valor_parcela: 2200,
    quantidade_parcelas: 4,
    observacoes: 'ATENÇÃO: Seguro vencido! Necessário renovação urgente.',
    corretor: 'Roberto Corretagens',
    telefone_corretor: '(11) 95432-1098',
    email_corretor: 'roberto@robertocorretagens.com.br',
    arquivo_apolice_url: 'https://exemplo.com/seguros/apolice-rolo-pneumatico-old.pdf',
    status: 'vencido',
    created_at: '2023-05-20T10:00:00Z',
    updated_at: '2024-06-01T10:00:00Z',
  },
  
  // Novo seguro para Rolo Pneumático (em renovação)
  {
    id: 'seg-5',
    maquinario_id: '4',
    seguradora: 'Mapfre Seguros',
    numero_apolice: 'MAP-2024-007890',
    tipo_cobertura: 'compreensiva',
    valor_segurado: 250000,
    valor_franquia: 4000,
    data_inicio_vigencia: '2024-09-01',
    data_fim_vigencia: '2025-08-31',
    forma_pagamento: 'parcelado_mensal',
    valor_premio: 10000,
    valor_parcela: 833.33,
    quantidade_parcelas: 12,
    dia_vencimento: 5,
    observacoes: 'Nova apólice com cobertura ampliada. Valor segurado aumentado em 13% em relação ao seguro anterior.',
    corretor: 'Ana Paula Seguros',
    telefone_corretor: '(11) 94321-0987',
    email_corretor: 'ana@anaseguros.com.br',
    arquivo_apolice_url: 'https://exemplo.com/seguros/apolice-rolo-pneumatico-nova.pdf',
    status: 'ativo',
    created_at: '2024-08-15T10:00:00Z',
    updated_at: '2024-08-15T10:00:00Z',
  },
];

/**
 * Sinistros mockados
 */
export const mockSinistros: SinistroSeguro[] = [
  {
    id: 'sin-1',
    seguro_id: 'seg-2',
    data_sinistro: '2024-07-15',
    tipo_sinistro: 'colisao',
    descricao: 'Colisão traseira durante manobra na obra. Danos na lateral direita do caminhão.',
    valor_prejuizo: 12000,
    valor_franquia_paga: 4500,
    valor_indenizado: 7500,
    numero_sinistro: 'SIN-BRA-2024-001234',
    status_sinistro: 'pago',
    data_abertura: '2024-07-16',
    data_conclusao: '2024-08-20',
    observacoes: 'Reparo realizado em oficina credenciada. Equipamento retornou em perfeitas condições.',
    created_at: '2024-07-16T10:00:00Z',
    updated_at: '2024-08-20T10:00:00Z',
  },
  {
    id: 'sin-2',
    seguro_id: 'seg-3',
    data_sinistro: '2024-03-10',
    tipo_sinistro: 'quebra_equipamento',
    descricao: 'Quebra do sistema hidráulico do rolo compactador durante operação.',
    valor_prejuizo: 8500,
    valor_franquia_paga: 3000,
    valor_indenizado: 5500,
    numero_sinistro: 'SIN-ITA-2024-000567',
    status_sinistro: 'pago',
    data_abertura: '2024-03-11',
    data_conclusao: '2024-04-15',
    observacoes: 'Cobertura parcial devido à natureza do dano. Manutenção preventiva recomendada.',
    created_at: '2024-03-11T10:00:00Z',
    updated_at: '2024-04-15T10:00:00Z',
  },
  {
    id: 'sin-3',
    seguro_id: 'seg-1',
    data_sinistro: '2024-09-05',
    tipo_sinistro: 'danos_terceiros',
    descricao: 'Dano a veículo de terceiro durante transporte do equipamento. Raspou na lataria.',
    valor_prejuizo: 3200,
    valor_franquia_paga: 0,
    valor_indenizado: 3200,
    numero_sinistro: 'SIN-PS-2024-002345',
    status_sinistro: 'em_analise',
    data_abertura: '2024-09-06',
    observacoes: 'Aguardando perícia final da seguradora. Documentação completa enviada.',
    created_at: '2024-09-06T10:00:00Z',
    updated_at: '2024-10-01T10:00:00Z',
  },
];

/**
 * Helper: Buscar seguros por maquinário
 */
export function getSegurosByMaquinarioId(maquinarioId: string): SeguroMaquinario[] {
  return mockSeguros.filter(s => s.maquinario_id === maquinarioId);
}

/**
 * Helper: Buscar seguro ativo de um maquinário
 */
export function getSeguroAtivoByMaquinarioId(maquinarioId: string): SeguroMaquinario | undefined {
  return mockSeguros.find(s => s.maquinario_id === maquinarioId && s.status === 'ativo');
}

/**
 * Helper: Buscar sinistros por seguro
 */
export function getSinistrosBySeguroId(seguroId: string): SinistroSeguro[] {
  return mockSinistros.filter(s => s.seguro_id === seguroId);
}

/**
 * Helper: Verificar se maquinário tem seguro ativo
 */
export function hasSeguroAtivo(maquinarioId: string): boolean {
  return mockSeguros.some(s => s.maquinario_id === maquinarioId && s.status === 'ativo');
}


