import { 
  Parceiro, 
  ParceiroCompleto, 
  ParceiroMaquinario, 
  ParceiroEquipe,
  NichoParceiro
} from '../types/parceiros'
import { CarregamentoRR2C, ConsumoRR2C } from '../types/carregamento-rr2c'

// Flag para usar mockups
const USE_MOCK = true

// ========== MOCKUPS ==========

const mockCarregamentosRR2C: CarregamentoRR2C[] = [
  {
    id: 'carr-1',
    parceiro_id: 'parc-3',
    data_carregamento: '2024-02-10',
    quantidade_kg: 8000,
    valor_total: 12000,
    numero_nota_fiscal: 'NF-78901',
    observacoes: 'Carregamento completo',
    created_at: '2024-02-10T10:00:00',
    updated_at: '2024-02-10T10:00:00'
  },
  {
    id: 'carr-2',
    parceiro_id: 'parc-3',
    data_carregamento: '2024-02-15',
    quantidade_kg: 5000,
    valor_total: 7500,
    numero_nota_fiscal: 'NF-79012',
    observacoes: 'Reposição parcial',
    created_at: '2024-02-15T14:30:00',
    updated_at: '2024-02-15T14:30:00'
  },
  {
    id: 'carr-3',
    parceiro_id: 'parc-3',
    data_carregamento: '2024-02-20',
    quantidade_kg: 6000,
    valor_total: 9000,
    numero_nota_fiscal: 'NF-79123',
    created_at: '2024-02-20T09:15:00',
    updated_at: '2024-02-20T09:15:00'
  }
]

const mockConsumosRR2C: ConsumoRR2C[] = [
  {
    id: 'cons-1',
    parceiro_id: 'parc-3',
    obra_id: '1',
    obra_nome: 'Pavimentação Rua das Flores - Osasco',
    rua_nome: 'Rua das Flores - Trecho 1',
    data_consumo: '2024-02-15',
    metragem_aplicada: 450,
    quantidade_consumida: 450, // 450m² × 1 kg/m²
    created_at: '2024-02-15T18:00:00'
  },
  {
    id: 'cons-2',
    parceiro_id: 'parc-3',
    obra_id: '1',
    obra_nome: 'Pavimentação Rua das Flores - Osasco',
    rua_nome: 'Rua das Flores - Trecho 2',
    data_consumo: '2024-02-16',
    metragem_aplicada: 520,
    quantidade_consumida: 520, // 520m² × 1 kg/m²
    created_at: '2024-02-16T19:00:00'
  },
  {
    id: 'cons-3',
    parceiro_id: 'parc-3',
    obra_id: '2',
    obra_nome: 'Avenida Central - Barueri',
    rua_nome: 'Avenida Central - Quadra A',
    data_consumo: '2024-02-20',
    metragem_aplicada: 680,
    quantidade_consumida: 680, // 680m² × 1 kg/m²
    created_at: '2024-02-20T17:45:00'
  }
]

const mockParceiros: Parceiro[] = [
  {
    id: 'parc-1',
    nome: 'Usina Central Asfalto',
    nicho: 'usina_asfalto',
    contato: 'João Silva',
    telefone: '(11) 98765-4321',
    email: 'contato@usinacentral.com.br',
    endereco: 'Av. Industrial, 1500 - São Paulo/SP',
    cnpj: '12.345.678/0001-90',
    precos_faixas: [
      { faixa: 'faixa_3', preco_tonelada: 380 },
      { faixa: 'faixa_4', preco_tonelada: 360 },
      { faixa: 'faixa_5', preco_tonelada: 340 },
      { faixa: 'binder', preco_tonelada: 350 }
    ],
    ativo: true,
    created_at: '2024-01-15T10:00:00',
    updated_at: '2024-01-15T10:00:00'
  },
  {
    id: 'parc-2',
    nome: 'Usina Asfalto Premium SP',
    nicho: 'usina_asfalto',
    contato: 'Pedro Almeida',
    telefone: '(11) 97777-8888',
    email: 'pedro@asphaltosp.com.br',
    endereco: 'Rodovia Anhanguera, Km 25 - Osasco/SP',
    cnpj: '22.333.444/0001-55',
    precos_faixas: [
      { faixa: 'faixa_3', preco_tonelada: 420 },
      { faixa: 'faixa_4', preco_tonelada: 400 },
      { faixa: 'faixa_5', preco_tonelada: 380 },
      { faixa: 'binder', preco_tonelada: 390 },
      { faixa: 'sma', preco_tonelada: 550 }
    ],
    ativo: true,
    created_at: '2024-01-18T15:00:00',
    updated_at: '2024-01-18T15:00:00'
  },
  {
    id: 'parc-3',
    nome: 'RR2C Premium',
    nicho: 'usina_rr2c',
    contato: 'Maria Santos',
    telefone: '(11) 97654-3210',
    email: 'maria@rr2cpremium.com.br',
    endereco: 'Rua dos Emulsionantes, 890 - Barueri/SP',
    cnpj: '98.765.432/0001-10',
    capacidade_tanque: 8000, // 8.000 litros
    estoque_atual: 5420, // 5.420 litros em estoque
    ativo: true,
    created_at: '2024-01-20T14:30:00',
    updated_at: '2024-01-20T14:30:00'
  },
  {
    id: 'parc-4',
    nome: 'Empreiteira Pav Solutions',
    nicho: 'empreiteiro',
    contato: 'Carlos Mendes',
    telefone: '(11) 96543-2109',
    email: 'carlos@pavsolutions.com.br',
    endereco: 'Av. das Máquinas, 450 - Guarulhos/SP',
    cnpj: '45.678.901/0001-23',
    ativo: true,
    created_at: '2024-02-01T09:00:00',
    updated_at: '2024-02-01T09:00:00'
  },
  {
    id: 'parc-5',
    nome: 'Empreiteira Costa & Filhos',
    nicho: 'empreiteiro',
    contato: 'Roberto Costa',
    telefone: '(11) 95432-1098',
    email: 'contato@costafilhos.com.br',
    endereco: 'Rua Pavimentação, 123 - São Paulo/SP',
    cnpj: '78.901.234/0001-56',
    ativo: true,
    created_at: '2024-02-10T11:15:00',
    updated_at: '2024-02-10T11:15:00'
  },
  {
    id: 'parc-6',
    nome: 'Asfaltos Brasil Terceirização',
    nicho: 'empreiteiro',
    contato: 'Ana Paula Rodrigues',
    telefone: '(11) 94444-5555',
    email: 'ana@asfaltosbrasil.com.br',
    endereco: 'Av. dos Trabalhadores, 789 - Taboão da Serra/SP',
    cnpj: '11.222.333/0001-44',
    ativo: true,
    created_at: '2024-02-15T10:30:00',
    updated_at: '2024-02-15T10:30:00'
  }
]

const mockMaquinarios: ParceiroMaquinario[] = [
  // Empreiteira Pav Solutions (parc-4)
  {
    id: 'maq-parc-1',
    parceiro_id: 'parc-4',
    nome: 'Caminhão Basculante Mercedes 2726',
    tipo: 'Caminhão Basculante',
    placa: 'ABC-1234',
    valor_diaria: 800,
    ativo: true,
    created_at: '2024-02-01T09:30:00',
    updated_at: '2024-02-01T09:30:00'
  },
  {
    id: 'maq-parc-2',
    parceiro_id: 'parc-4',
    nome: 'Rolo Compactador Dynapac CA25',
    tipo: 'Rolo Compactador',
    placa: 'DEF-5678',
    valor_diaria: 1200,
    ativo: true,
    created_at: '2024-02-01T09:35:00',
    updated_at: '2024-02-01T09:35:00'
  },
  {
    id: 'maq-parc-3',
    parceiro_id: 'parc-4',
    nome: 'Caminhão Pipa Volkswagen 24-280',
    tipo: 'Caminhão Pipa',
    placa: 'MNO-7890',
    valor_diaria: 600,
    ativo: true,
    created_at: '2024-02-01T09:40:00',
    updated_at: '2024-02-01T09:40:00'
  },
  // Empreiteira Costa & Filhos (parc-5)
  {
    id: 'maq-parc-4',
    parceiro_id: 'parc-5',
    nome: 'Pá Carregadeira Caterpillar 938H',
    tipo: 'Pá Carregadeira',
    placa: 'GHI-9012',
    valor_diaria: 1500,
    ativo: true,
    created_at: '2024-02-10T11:30:00',
    updated_at: '2024-02-10T11:30:00'
  },
  {
    id: 'maq-parc-5',
    parceiro_id: 'parc-5',
    nome: 'Retroescavadeira JCB 3CX',
    tipo: 'Retroescavadeira',
    placa: 'JKL-3456',
    valor_diaria: 900,
    ativo: true,
    created_at: '2024-02-10T11:35:00',
    updated_at: '2024-02-10T11:35:00'
  },
  // Asfaltos Brasil Terceirização (parc-6)
  {
    id: 'maq-parc-6',
    parceiro_id: 'parc-6',
    nome: 'Vibroacabadora Vogele S1800',
    tipo: 'Vibroacabadora',
    placa: 'PQR-1122',
    valor_diaria: 2000,
    ativo: true,
    created_at: '2024-02-15T10:45:00',
    updated_at: '2024-02-15T10:45:00'
  },
  {
    id: 'maq-parc-7',
    parceiro_id: 'parc-6',
    nome: 'Rolo Compactador Bomag BW213',
    tipo: 'Rolo Compactador',
    placa: 'STU-3344',
    valor_diaria: 1100,
    ativo: true,
    created_at: '2024-02-15T10:50:00',
    updated_at: '2024-02-15T10:50:00'
  },
  {
    id: 'maq-parc-8',
    parceiro_id: 'parc-6',
    nome: 'Caminhão Basculante Scania P320',
    tipo: 'Caminhão Basculante',
    placa: 'VWX-5566',
    valor_diaria: 850,
    ativo: true,
    created_at: '2024-02-15T10:55:00',
    updated_at: '2024-02-15T10:55:00'
  }
]

const mockEquipes: ParceiroEquipe[] = [
  // Empreiteira Pav Solutions (parc-4)
  {
    id: 'eq-parc-1',
    parceiro_id: 'parc-4',
    nome: 'Equipe Pavimentação Alpha',
    quantidade_pessoas: 8,
    valor_diaria: 3200,
    especialidade: 'Pavimentação',
    ativo: true,
    created_at: '2024-02-01T10:00:00',
    updated_at: '2024-02-01T10:00:00'
  },
  {
    id: 'eq-parc-2',
    parceiro_id: 'parc-4',
    nome: 'Equipe Sinalização Beta',
    quantidade_pessoas: 4,
    valor_diaria: 1600,
    especialidade: 'Sinalização',
    ativo: true,
    created_at: '2024-02-01T10:05:00',
    updated_at: '2024-02-01T10:05:00'
  },
  // Empreiteira Costa & Filhos (parc-5)
  {
    id: 'eq-parc-3',
    parceiro_id: 'parc-5',
    nome: 'Equipe Terraplenagem Gama',
    quantidade_pessoas: 6,
    valor_diaria: 2400,
    especialidade: 'Terraplenagem',
    ativo: true,
    created_at: '2024-02-10T12:00:00',
    updated_at: '2024-02-10T12:00:00'
  },
  {
    id: 'eq-parc-4',
    parceiro_id: 'parc-5',
    nome: 'Equipe Drenagem Delta',
    quantidade_pessoas: 5,
    valor_diaria: 2000,
    especialidade: 'Drenagem',
    ativo: true,
    created_at: '2024-02-10T12:05:00',
    updated_at: '2024-02-10T12:05:00'
  },
  // Asfaltos Brasil Terceirização (parc-6)
  {
    id: 'eq-parc-5',
    parceiro_id: 'parc-6',
    nome: 'Equipe Pavimentação Premium',
    quantidade_pessoas: 10,
    valor_diaria: 4000,
    especialidade: 'Pavimentação',
    ativo: true,
    created_at: '2024-02-15T11:00:00',
    updated_at: '2024-02-15T11:00:00'
  },
  {
    id: 'eq-parc-6',
    parceiro_id: 'parc-6',
    nome: 'Equipe Meio-Fio Especializada',
    quantidade_pessoas: 6,
    valor_diaria: 2400,
    especialidade: 'Meio-Fio',
    ativo: true,
    created_at: '2024-02-15T11:05:00',
    updated_at: '2024-02-15T11:05:00'
  },
  {
    id: 'eq-parc-7',
    parceiro_id: 'parc-6',
    nome: 'Equipe Geral Multifuncional',
    quantidade_pessoas: 7,
    valor_diaria: 2800,
    especialidade: 'Geral',
    ativo: true,
    created_at: '2024-02-15T11:10:00',
    updated_at: '2024-02-15T11:10:00'
  }
]

// ========== FUNÇÕES API ==========

/**
 * Busca todos os parceiros
 */
export async function getParceiros(nicho?: NichoParceiro): Promise<Parceiro[]> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    if (nicho) {
      return mockParceiros.filter(p => p.nicho === nicho && p.ativo)
    }
    
    return mockParceiros.filter(p => p.ativo)
  }
  
  // Implementação real virá aqui
  throw new Error('Implementação real pendente')
}

/**
 * Busca parceiro por ID (com maquinários e equipes)
 */
export async function getParceiroById(id: string): Promise<ParceiroCompleto | null> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const parceiro = mockParceiros.find(p => p.id === id)
    if (!parceiro) return null
    
    const maquinarios = mockMaquinarios.filter(m => m.parceiro_id === id)
    const equipes = mockEquipes.filter(e => e.parceiro_id === id)
    
    return {
      ...parceiro,
      maquinarios,
      equipes
    }
  }
  
  throw new Error('Implementação real pendente')
}

/**
 * Busca maquinários de parceiros empreiteiros
 */
export async function getMaquinariosParceiros(): Promise<ParceiroMaquinario[]> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Retorna apenas maquinários de empreiteiros ativos
    const empreiteiros = mockParceiros.filter(p => p.nicho === 'empreiteiro' && p.ativo)
    const empreiteirosIds = empreiteiros.map(e => e.id)
    
    return mockMaquinarios.filter(m => empreiteirosIds.includes(m.parceiro_id) && m.ativo)
  }
  
  throw new Error('Implementação real pendente')
}

/**
 * Busca equipes de parceiros empreiteiros
 */
export async function getEquipesParceiros(): Promise<ParceiroEquipe[]> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Retorna apenas equipes de empreiteiros ativos
    const empreiteiros = mockParceiros.filter(p => p.nicho === 'empreiteiro' && p.ativo)
    const empreiteirosIds = empreiteiros.map(e => e.id)
    
    return mockEquipes.filter(e => empreiteirosIds.includes(e.parceiro_id) && e.ativo)
  }
  
  throw new Error('Implementação real pendente')
}

/**
 * Cria novo parceiro
 */
export async function createParceiro(data: Omit<Parceiro, 'id' | 'created_at' | 'updated_at'>): Promise<Parceiro> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const novoParceiro: Parceiro = {
      ...data,
      id: `parc-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    mockParceiros.push(novoParceiro)
    return novoParceiro
  }
  
  throw new Error('Implementação real pendente')
}

/**
 * Adiciona maquinário a um parceiro
 */
export async function addMaquinarioParceiro(
  parceiro_id: string,
  data: Omit<ParceiroMaquinario, 'id' | 'parceiro_id' | 'created_at' | 'updated_at'>
): Promise<ParceiroMaquinario> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const novoMaquinario: ParceiroMaquinario = {
      ...data,
      id: `maq-parc-${Date.now()}`,
      parceiro_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    mockMaquinarios.push(novoMaquinario)
    return novoMaquinario
  }
  
  throw new Error('Implementação real pendente')
}

/**
 * Adiciona equipe a um parceiro
 */
export async function addEquipeParceiro(
  parceiro_id: string,
  data: Omit<ParceiroEquipe, 'id' | 'parceiro_id' | 'created_at' | 'updated_at'>
): Promise<ParceiroEquipe> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const novaEquipe: ParceiroEquipe = {
      ...data,
      id: `eq-parc-${Date.now()}`,
      parceiro_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    mockEquipes.push(novaEquipe)
    return novaEquipe
  }
  
  throw new Error('Implementação real pendente')
}

/**
 * Busca carregamentos de RR2C de um parceiro
 */
export async function getCarregamentosRR2C(parceiro_id: string): Promise<CarregamentoRR2C[]> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 200))
    return mockCarregamentosRR2C.filter(c => c.parceiro_id === parceiro_id)
  }
  
  throw new Error('Implementação real pendente')
}

/**
 * Busca consumos de RR2C de um parceiro
 */
export async function getConsumosRR2C(parceiro_id: string): Promise<ConsumoRR2C[]> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 200))
    return mockConsumosRR2C.filter(c => c.parceiro_id === parceiro_id)
  }
  
  throw new Error('Implementação real pendente')
}

/**
 * Cria novo carregamento de RR2C
 */
export async function createCarregamentoRR2C(
  data: Omit<CarregamentoRR2C, 'id' | 'created_at' | 'updated_at'>
): Promise<CarregamentoRR2C> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const novoCarregamento: CarregamentoRR2C = {
      ...data,
      id: `carr-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    mockCarregamentosRR2C.push(novoCarregamento)
    
    // Atualizar estoque do parceiro
    const parceiro = mockParceiros.find(p => p.id === data.parceiro_id)
    if (parceiro) {
      parceiro.estoque_atual = (parceiro.estoque_atual || 0) + data.quantidade_kg
    }
    
    return novoCarregamento
  }
  
  throw new Error('Implementação real pendente')
}

