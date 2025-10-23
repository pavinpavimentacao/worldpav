/**
 * DADOS MOCKADOS - Licenças de Maquinários e Veículos
 */

import type { LicencaMaquinario } from '../types/maquinarios-licencas';

/**
 * Licenças mockadas para diferentes maquinários
 */
export const mockLicencas: LicencaMaquinario[] = [
  // Espargidor de Emulsão Volvo FMX - ID: 2
  // Licenças obrigatórias: ANTT, Ambipar, CIPP, CIV
  {
    id: 'lic-1',
    maquinario_id: '2',
    tipo_licenca: 'ANTT',
    numero_licenca: 'ANTT-2024-0012345',
    orgao_emissor: 'Agência Nacional de Transportes Terrestres',
    data_emissao: '2024-01-10',
    data_validade: '2025-01-09',
    arquivo_url: 'https://exemplo.com/licencas/antt-espargidor.pdf',
    status: 'valida',
    observacoes: 'Registro para transporte de produtos químicos (emulsão asfáltica)',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z',
  },
  {
    id: 'lic-2',
    maquinario_id: '2',
    tipo_licenca: 'Ambipar',
    numero_licenca: 'AMB-SP-2024-567',
    orgao_emissor: 'CETESB - Companhia Ambiental do Estado de São Paulo',
    data_emissao: '2024-02-01',
    data_validade: '2025-01-31',
    arquivo_url: 'https://exemplo.com/licencas/ambipar-espargidor.pdf',
    status: 'valida',
    observacoes: 'Licença ambiental para transporte e aplicação de emulsão asfáltica',
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-02-01T10:00:00Z',
  },
  {
    id: 'lic-3',
    maquinario_id: '2',
    tipo_licenca: 'CIPP',
    numero_licenca: 'CIPP-2024-789',
    orgao_emissor: 'INMETRO',
    data_emissao: '2024-01-15',
    data_validade: '2025-01-14',
    arquivo_url: 'https://exemplo.com/licencas/cipp-espargidor.pdf',
    status: 'valida',
    observacoes: 'Certificado para transporte de produtos perigosos - Emulsão asfáltica classificada',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'lic-4',
    maquinario_id: '2',
    tipo_licenca: 'CIV',
    numero_licenca: 'CIV-SP-2024-4567',
    orgao_emissor: 'DETRAN-SP',
    data_emissao: '2024-03-01',
    data_validade: '2025-02-28',
    arquivo_url: 'https://exemplo.com/licencas/civ-espargidor.pdf',
    status: 'valida',
    observacoes: 'Certificado de Inspeção Veicular anual obrigatório',
    created_at: '2024-03-01T10:00:00Z',
    updated_at: '2024-03-01T10:00:00Z',
  },

  // Vibroacabadora CAT AP1055F - ID: 1
  // Não precisa de licenças tão específicas, mas pode ter CRLV
  {
    id: 'lic-5',
    maquinario_id: '1',
    tipo_licenca: 'CRLV',
    numero_licenca: 'CRLV-2024-8901',
    orgao_emissor: 'DETRAN-SP',
    data_emissao: '2024-01-05',
    data_validade: '2025-01-04',
    arquivo_url: 'https://exemplo.com/licencas/crlv-vibroacabadora.pdf',
    status: 'valida',
    observacoes: 'Certificado de Registro e Licenciamento do Veículo - Renovação anual',
    created_at: '2024-01-05T10:00:00Z',
    updated_at: '2024-01-05T10:00:00Z',
  },

  // Rolo Compactador Chapa - ID: 3
  {
    id: 'lic-6',
    maquinario_id: '3',
    tipo_licenca: 'CIV',
    numero_licenca: 'CIV-SP-2023-5678',
    orgao_emissor: 'DETRAN-SP',
    data_emissao: '2023-11-01',
    data_validade: '2024-10-31',
    arquivo_url: 'https://exemplo.com/licencas/civ-rolo-chapa.pdf',
    status: 'vencida',
    observacoes: 'ATENÇÃO: Licença vencida! Renovar urgentemente.',
    created_at: '2023-11-01T10:00:00Z',
    updated_at: '2024-11-01T10:00:00Z',
  },

  // Rolo Pneumático Bomag - ID: 4
  {
    id: 'lic-7',
    maquinario_id: '4',
    tipo_licenca: 'CRLV',
    numero_licenca: 'CRLV-2024-6789',
    orgao_emissor: 'DETRAN-SP',
    data_emissao: '2024-06-01',
    data_validade: '2025-05-31',
    arquivo_url: 'https://exemplo.com/licencas/crlv-rolo-pneumatico.pdf',
    status: 'valida',
    observacoes: 'Licenciamento em dia',
    created_at: '2024-06-01T10:00:00Z',
    updated_at: '2024-06-01T10:00:00Z',
  },
  {
    id: 'lic-8',
    maquinario_id: '4',
    tipo_licenca: 'CIV',
    numero_licenca: 'CIV-SP-2024-7890',
    orgao_emissor: 'DETRAN-SP',
    data_emissao: '2024-06-01',
    data_validade: '2024-11-15',
    arquivo_url: 'https://exemplo.com/licencas/civ-rolo-pneumatico.pdf',
    status: 'em_renovacao',
    observacoes: 'Vence em breve - agendar renovação',
    created_at: '2024-06-01T10:00:00Z',
    updated_at: '2024-10-01T10:00:00Z',
  },
];

/**
 * Helper: Buscar licenças por maquinário
 */
export function getLicencasByMaquinarioId(maquinarioId: string): LicencaMaquinario[] {
  return mockLicencas.filter(l => l.maquinario_id === maquinarioId);
}

/**
 * Helper: Buscar licença específica por tipo
 */
export function getLicencaByTipo(maquinarioId: string, tipo: string): LicencaMaquinario | undefined {
  return mockLicencas.find(l => l.maquinario_id === maquinarioId && l.tipo_licenca === tipo);
}

/**
 * Helper: Verificar se tem todas licenças obrigatórias para espargidor
 */
export function verificarLicencasEspargidor(maquinarioId: string): {
  antt: boolean;
  ambipar: boolean;
  cipp: boolean;
  civ: boolean;
  completo: boolean;
} {
  const licencas = getLicencasByMaquinarioId(maquinarioId);
  
  return {
    antt: licencas.some(l => l.tipo_licenca === 'ANTT' && l.status === 'valida'),
    ambipar: licencas.some(l => l.tipo_licenca === 'Ambipar' && l.status === 'valida'),
    cipp: licencas.some(l => l.tipo_licenca === 'CIPP' && l.status === 'valida'),
    civ: licencas.some(l => l.tipo_licenca === 'CIV' && l.status === 'valida'),
    completo: 
      licencas.some(l => l.tipo_licenca === 'ANTT' && l.status === 'valida') &&
      licencas.some(l => l.tipo_licenca === 'Ambipar' && l.status === 'valida') &&
      licencas.some(l => l.tipo_licenca === 'CIPP' && l.status === 'valida') &&
      licencas.some(l => l.tipo_licenca === 'CIV' && l.status === 'valida'),
  };
}


