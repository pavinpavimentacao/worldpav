/**
 * API - Sistema de Guardas
 * Gerenciamento de empresas de guarda, guardas e diárias
 * Comunicação com Supabase
 */

import { supabase } from './supabase';
import type {
  EmpresaGuarda,
  CreateEmpresaGuardaInput,
  Guarda,
  CreateGuardaInput,
  DiariaGuarda,
  DiariaGuardaCompleta,
  DiariaMaquinario,
  TurnoGuarda,
} from '../types/guardas';

// ============================================
// HELPERS - MAQUINÁRIOS, OBRAS E RUAS
// ============================================

/**
 * Lista todos os maquinários ativos
 */
export async function listarMaquinarios(): Promise<Array<{
  id: string;
  name: string;
  type: string;
  plate: string;
  status: string;
}>> {
  const { data, error } = await supabase
    .from('maquinarios')
    .select('id, name, type, plate, status')
    .is('deleted_at', null)
    .order('name', { ascending: true });

  if (error) {
    console.error('Erro ao listar maquinários:', error);
    throw new Error(`Erro ao listar maquinários: ${error.message}`);
  }

  return data || [];
}

/**
 * Lista todas as obras ativas
 */
export async function listarObras(): Promise<Array<{
  id: string;
  name: string;
  status: string;
}>> {
  const { data, error } = await supabase
    .from('obras')
    .select('id, name, status')
    .is('deleted_at', null)
    .order('name', { ascending: true });

  if (error) {
    console.error('Erro ao listar obras:', error);
    throw new Error(`Erro ao listar obras: ${error.message}`);
  }

  return data || [];
}

/**
 * Lista ruas de uma obra específica
 */
export async function listarRuasPorObra(obraId: string): Promise<Array<{
  id: string;
  name: string;
  status: string;
}>> {
  const { data, error } = await supabase
    .from('obras_ruas')
    .select('id, name, status')
    .eq('obra_id', obraId)
    .is('deleted_at', null)
    .order('name', { ascending: true });

  if (error) {
    console.error('Erro ao listar ruas:', error);
    throw new Error(`Erro ao listar ruas: ${error.message}`);
  }

  return data || [];
}

// ============================================
// EMPRESAS DE GUARDA
// ============================================

/**
 * Lista todas as empresas de guarda ativas
 */
export async function listarEmpresasGuarda(): Promise<EmpresaGuarda[]> {
  const { data, error } = await supabase
    .from('empresas_guarda')
    .select('*')
    .is('deleted_at', null)
    .order('nome', { ascending: true });

  if (error) {
    console.error('Erro ao listar empresas de guarda:', error);
    throw new Error(`Erro ao listar empresas: ${error.message}`);
  }

  return data || [];
}

/**
 * Busca uma empresa de guarda por ID
 */
export async function buscarEmpresaGuarda(id: string): Promise<EmpresaGuarda | null> {
  const { data, error } = await supabase
    .from('empresas_guarda')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Erro ao buscar empresa:', error);
    throw new Error(`Erro ao buscar empresa: ${error.message}`);
  }

  return data;
}

/**
 * Cria uma nova empresa de guarda
 */
export async function criarEmpresaGuarda(input: CreateEmpresaGuardaInput): Promise<EmpresaGuarda> {
  const { data, error } = await supabase
    .from('empresas_guarda')
    .insert({
      nome: input.nome,
      telefone: input.telefone,
      documento: input.documento,
      tipo_documento: input.tipo_documento,
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar empresa:', error);
    throw new Error(`Erro ao criar empresa: ${error.message}`);
  }

  return data;
}

/**
 * Atualiza uma empresa de guarda
 */
export async function atualizarEmpresaGuarda(
  id: string,
  input: Partial<CreateEmpresaGuardaInput>
): Promise<EmpresaGuarda> {
  const { data, error } = await supabase
    .from('empresas_guarda')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar empresa:', error);
    throw new Error(`Erro ao atualizar empresa: ${error.message}`);
  }

  return data;
}

/**
 * Desativa uma empresa de guarda (soft delete)
 */
export async function desativarEmpresaGuarda(id: string): Promise<void> {
  const { error } = await supabase
    .from('empresas_guarda')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Erro ao desativar empresa:', error);
    throw new Error(`Erro ao desativar empresa: ${error.message}`);
  }
}

// ============================================
// GUARDAS
// ============================================

/**
 * Lista todos os guardas ativos
 */
export async function listarGuardas(): Promise<Guarda[]> {
  const { data, error } = await supabase
    .from('guardas_seguranca')
    .select(`
      *,
      empresa:empresas_guarda(nome)
    `)
    .is('deleted_at', null)
    .order('nome', { ascending: true });

  if (error) {
    console.error('Erro ao listar guardas:', error);
    throw new Error(`Erro ao listar guardas: ${error.message}`);
  }

  // Mapear para incluir empresa_nome
  return (data || []).map((item: any) => ({
    ...item,
    empresa_nome: item.empresa?.nome,
  }));
}

/**
 * Lista guardas por empresa
 */
export async function listarGuardasPorEmpresa(empresaId: string): Promise<Guarda[]> {
  const { data, error } = await supabase
    .from('guardas_seguranca')
    .select(`
      *,
      empresa:empresas_guarda(nome)
    `)
    .eq('company_id', empresaId)
    .is('deleted_at', null)
    .order('nome', { ascending: true });

  if (error) {
    console.error('Erro ao listar guardas por empresa:', error);
    throw new Error(`Erro ao listar guardas: ${error.message}`);
  }

  return (data || []).map((item: any) => ({
    ...item,
    empresa_nome: item.empresa?.nome,
  }));
}

/**
 * Busca um guarda por ID
 */
export async function buscarGuarda(id: string): Promise<Guarda | null> {
  const { data, error } = await supabase
    .from('guardas_seguranca')
    .select(`
      *,
      empresa:empresas_guarda(nome)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Erro ao buscar guarda:', error);
    throw new Error(`Erro ao buscar guarda: ${error.message}`);
  }

  return {
    ...data,
    empresa_nome: data.empresa?.nome,
  };
}

/**
 * Cria um novo guarda
 */
export async function criarGuarda(input: CreateGuardaInput): Promise<Guarda> {
  const { data, error } = await supabase
    .from('guardas_seguranca')
    .insert({
      nome: input.nome,
      telefone: input.telefone,
      company_id: input.empresa_id,
    })
    .select(`
      *,
      empresa:empresas_guarda(nome)
    `)
    .single();

  if (error) {
    console.error('Erro ao criar guarda:', error);
    throw new Error(`Erro ao criar guarda: ${error.message}`);
  }

  return {
    ...data,
    empresa_nome: data.empresa?.nome,
  };
}

/**
 * Atualiza um guarda
 */
export async function atualizarGuarda(
  id: string,
  input: Partial<CreateGuardaInput>
): Promise<Guarda> {
  const { data, error } = await supabase
    .from('guardas_seguranca')
    .update(input)
    .eq('id', id)
    .select(`
      *,
      empresa:empresas_guarda(nome)
    `)
    .single();

  if (error) {
    console.error('Erro ao atualizar guarda:', error);
    throw new Error(`Erro ao atualizar guarda: ${error.message}`);
  }

  return {
    ...data,
    empresa_nome: data.empresa?.nome,
  };
}

/**
 * Desativa um guarda (soft delete)
 */
export async function desativarGuarda(id: string): Promise<void> {
  const { error } = await supabase
    .from('guardas_seguranca')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Erro ao desativar guarda:', error);
    throw new Error(`Erro ao desativar guarda: ${error.message}`);
  }
}

// ============================================
// DIÁRIAS DE GUARDA
// ============================================

/**
 * Lista todas as diárias com maquinários
 */
export async function listarDiarias(filtros?: {
  dataInicio?: string;
  dataFim?: string;
  guardaId?: string;
  empresaId?: string;
  turno?: TurnoGuarda;
  obraId?: string;
}): Promise<DiariaGuardaCompleta[]> {
  let query = supabase
    .from('diarias_guarda_seguranca')
    .select(`
      *,
      guarda:guardas_seguranca(nome),
      empresa:empresas_guarda(nome),
      obra:obras(name),
      rua:obras_ruas(name),
      maquinarios:diarias_seguranca_maquinarios(
        id,
        maquinario_id,
        created_at,
        maquinario:maquinarios(name, type, plate)
      )
    `)
    .order('data_diaria', { ascending: false })
    .order('created_at', { ascending: false });

  // Aplicar filtros
  if (filtros?.dataInicio) {
    query = query.gte('data_diaria', filtros.dataInicio);
  }
  if (filtros?.dataFim) {
    query = query.lte('data_diaria', filtros.dataFim);
  }
  if (filtros?.guardaId) {
    query = query.eq('guarda_id', filtros.guardaId);
  }
  if (filtros?.empresaId) {
    query = query.eq('company_id', filtros.empresaId);
  }
  if (filtros?.turno) {
    query = query.eq('turno', filtros.turno);
  }
  if (filtros?.obraId) {
    query = query.eq('obra_id', filtros.obraId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Erro ao listar diárias:', error);
    throw new Error(`Erro ao listar diárias: ${error.message}`);
  }

  // Mapear para incluir nomes
  return (data || []).map((item: any) => ({
    ...item,
    guarda_nome: item.guarda?.nome,
    empresa_nome: item.empresa?.nome,
    obra_nome: item.obra?.name,
    rua_nome: item.rua?.name || item.rua_nome,
    maquinarios: (item.maquinarios || []).map((maq: any) => ({
      id: maq.id,
      diaria_id: item.id,
      maquinario_id: maq.maquinario_id,
      maquinario_nome: maq.maquinario?.name || `Maquinário ${maq.maquinario_id}`,
      maquinario_tipo: maq.maquinario?.type,
      maquinario_placa: maq.maquinario?.plate,
      created_at: maq.created_at,
    })),
  }));
}

/**
 * Busca uma diária por ID com maquinários
 */
export async function buscarDiaria(id: string): Promise<DiariaGuardaCompleta | null> {
  const { data, error } = await supabase
    .from('diarias_guarda_seguranca')
    .select(`
      *,
      guarda:guardas_seguranca(nome),
      empresa:empresas_guarda(nome),
      obra:obras(name),
      rua:obras_ruas(name),
      maquinarios:diarias_seguranca_maquinarios(
        id,
        maquinario_id,
        created_at,
        maquinario:maquinarios(name, type, plate)
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Erro ao buscar diária:', error);
    throw new Error(`Erro ao buscar diária: ${error.message}`);
  }

  return {
    ...data,
    guarda_nome: data.guarda?.nome,
    empresa_nome: data.empresa?.nome,
    obra_nome: data.obra?.name,
    rua_nome: data.rua?.name || data.rua_nome,
    maquinarios: (data.maquinarios || []).map((maq: any) => ({
      id: maq.id,
      diaria_id: data.id,
      maquinario_id: maq.maquinario_id,
      maquinario_nome: maq.maquinario?.name || `Maquinário ${maq.maquinario_id}`,
      maquinario_tipo: maq.maquinario?.type,
      maquinario_placa: maq.maquinario?.plate,
      created_at: maq.created_at,
    })),
  };
}

/**
 * Cria uma nova diária de guarda com maquinários
 */
export async function criarDiaria(input: {
  guarda_id: string;
  solicitante: string;
  valor_diaria: number;
  data_diaria: string;
  turno: TurnoGuarda;
  obra_id?: string;
  rua_id?: string;
  rua_nome?: string;
  maquinarios_ids: string[];
  foto_maquinario_url?: string;
  observacoes?: string;
}): Promise<DiariaGuardaCompleta> {
  // 1. Buscar company_id do guarda
  const { data: guarda, error: guardaError } = await supabase
    .from('guardas_seguranca')
    .select('company_id')
    .eq('id', input.guarda_id)
    .single();

  if (guardaError || !guarda) {
    throw new Error('Guarda não encontrado');
  }

  // 2. Se rua_id foi fornecido, buscar o nome da rua
  let ruaNome = input.rua_nome;
  if (input.rua_id && !ruaNome) {
    const { data: rua } = await supabase
      .from('obras_ruas')
      .select('name')
      .eq('id', input.rua_id)
      .is('deleted_at', null)
      .single();
    ruaNome = rua?.name;
  }

  // 3. Criar a diária
  const { data: diaria, error: diariaError } = await supabase
    .from('diarias_guarda_seguranca')
    .insert({
      guarda_id: input.guarda_id,
      company_id: guarda.company_id,
      obra_id: input.obra_id || null,
      rua_id: input.rua_id || null,
      rua_nome: ruaNome,
      solicitante: input.solicitante,
      valor_diaria: input.valor_diaria,
      data_diaria: input.data_diaria,
      turno: input.turno,
      foto_maquinario_url: input.foto_maquinario_url,
      observacoes: input.observacoes,
    })
    .select()
    .single();

  if (diariaError || !diaria) {
    console.error('Erro ao criar diária:', diariaError);
    throw new Error(`Erro ao criar diária: ${diariaError?.message}`);
  }

  // 4. Vincular maquinários
  const maquinariosData = input.maquinarios_ids.map((maqId) => ({
    diaria_id: diaria.id,
    maquinario_id: maqId,
  }));

  const { data: maquinarios, error: maquinariosError } = await supabase
    .from('diarias_seguranca_maquinarios')
    .insert(maquinariosData)
    .select();

  if (maquinariosError) {
    console.error('Erro ao vincular maquinários:', maquinariosError);
    // Rollback: deletar a diária
    await supabase.from('diarias_guarda_seguranca').delete().eq('id', diaria.id);
    throw new Error(`Erro ao vincular maquinários: ${maquinariosError.message}`);
  }

  // 5. Buscar diária completa
  return await buscarDiaria(diaria.id) as DiariaGuardaCompleta;
}

/**
 * Atualiza uma diária (com maquinários opcionalmente)
 */
export async function atualizarDiaria(
  id: string,
  input: Partial<{
    solicitante: string;
    valor_diaria: number;
    data_diaria: string;
    turno: TurnoGuarda;
    obra_id: string | null;
    rua_id: string | null;
    rua_nome: string;
    foto_maquinario_url: string;
    observacoes: string;
    maquinarios_ids: string[];
  }>
): Promise<DiariaGuardaCompleta> {
  // 1. Se rua_id foi fornecido, buscar o nome da rua
  let updateData: any = { ...input };
  delete updateData.maquinarios_ids; // Remover antes de atualizar

  if (input.rua_id && !input.rua_nome) {
    const { data: rua } = await supabase
      .from('obras_ruas')
      .select('name')
      .eq('id', input.rua_id)
      .is('deleted_at', null)
      .single();
    updateData.rua_nome = rua?.name;
  }

  // 2. Atualizar a diária
  const { error } = await supabase
    .from('diarias_guarda_seguranca')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Erro ao atualizar diária:', error);
    throw new Error(`Erro ao atualizar diária: ${error.message}`);
  }

  // 3. Se maquinarios_ids foi fornecido, atualizar os maquinários
  if (input.maquinarios_ids && input.maquinarios_ids.length > 0) {
    // 3.1 Remover maquinários antigos
    await supabase
      .from('diarias_seguranca_maquinarios')
      .delete()
      .eq('diaria_id', id);

    // 3.2 Adicionar novos maquinários
    const maquinariosData = input.maquinarios_ids.map((maqId) => ({
      diaria_id: id,
      maquinario_id: maqId,
    }));

    const { error: maquinariosError } = await supabase
      .from('diarias_seguranca_maquinarios')
      .insert(maquinariosData);

    if (maquinariosError) {
      console.error('Erro ao atualizar maquinários:', maquinariosError);
      throw new Error(`Erro ao atualizar maquinários: ${maquinariosError.message}`);
    }
  }

  return await buscarDiaria(id) as DiariaGuardaCompleta;
}

/**
 * Deleta uma diária (hard delete, cascata deleta maquinários)
 */
export async function deletarDiaria(id: string): Promise<void> {
  const { error } = await supabase
    .from('diarias_guarda_seguranca')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao deletar diária:', error);
    throw new Error(`Erro ao deletar diária: ${error.message}`);
  }
}

/**
 * Lista diárias de um maquinário específico
 */
export async function listarDiariasPorMaquinario(maquinarioId: string): Promise<DiariaGuardaCompleta[]> {
  // Buscar IDs de diárias que usaram este maquinário
  const { data: diariasMaq, error: maqError } = await supabase
    .from('diarias_seguranca_maquinarios')
    .select('diaria_id')
    .eq('maquinario_id', maquinarioId);

  if (maqError) {
    console.error('Erro ao buscar diárias do maquinário:', maqError);
    throw new Error(`Erro ao buscar diárias do maquinário: ${maqError.message}`);
  }

  if (!diariasMaq || diariasMaq.length === 0) {
    return [];
  }

  const diariaIds = diariasMaq.map(d => d.diaria_id);

  // Buscar as diárias completas
  const { data, error } = await supabase
    .from('diarias_guarda_seguranca')
    .select(`
      *,
      guarda:guardas_seguranca(nome),
      empresa:empresas_guarda(nome),
      obra:obras(name),
      rua:obras_ruas(name),
      maquinarios:diarias_seguranca_maquinarios(
        id,
        maquinario_id,
        created_at,
        maquinario:maquinarios(name, type, plate)
      )
    `)
    .in('id', diariaIds)
    .order('data_diaria', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao listar diárias:', error);
    throw new Error(`Erro ao listar diárias: ${error.message}`);
  }

  // Mapear para incluir nomes
  return (data || []).map((item: any) => ({
    ...item,
    guarda_nome: item.guarda?.nome,
    empresa_nome: item.empresa?.nome,
    obra_nome: item.obra?.name,
    rua_nome: item.rua?.name || item.rua_nome,
    maquinarios: (item.maquinarios || []).map((maq: any) => ({
      id: maq.id,
      diaria_id: item.id,
      maquinario_id: maq.maquinario_id,
      maquinario_nome: maq.maquinario?.name || `Maquinário ${maq.maquinario_id}`,
      maquinario_tipo: maq.maquinario?.type,
      maquinario_placa: maq.maquinario?.plate,
      created_at: maq.created_at,
    })),
  }));
}

// ============================================
// ESTATÍSTICAS
// ============================================

/**
 * Retorna estatísticas gerais do sistema de guardas
 */
export async function obterEstatisticasGuardas(): Promise<{
  totalEmpresas: number;
  totalGuardas: number;
  totalDiarias: number;
  valorTotal: number;
  valorMedio: number;
}> {
  // Contar empresas ativas
  const { count: countEmpresas } = await supabase
    .from('empresas_guarda')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null);

  // Contar guardas ativos
  const { count: countGuardas } = await supabase
    .from('guardas_seguranca')
    .select('*', { count: 'exact', head: true })
    .is('deleted_at', null);

  // Contar diárias e somar valores
  const { data: diarias, count: countDiarias } = await supabase
    .from('diarias_guarda_seguranca')
    .select('valor_diaria', { count: 'exact' });

  const valorTotal = (diarias || []).reduce((acc, d) => acc + (Number(d.valor_diaria) || 0), 0);
  const valorMedio = countDiarias && countDiarias > 0 ? valorTotal / countDiarias : 0;

  return {
    totalEmpresas: countEmpresas || 0,
    totalGuardas: countGuardas || 0,
    totalDiarias: countDiarias || 0,
    valorTotal,
    valorMedio,
  };
}

/**
 * Upload de foto de maquinário
 */
export async function uploadFotoMaquinario(file: File): Promise<string> {
  const fileName = `diarias/${Date.now()}-${file.name}`;
  
  const { data, error } = await supabase.storage
    .from('guardas') // Bucket 'guardas' precisa existir
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Erro ao fazer upload da foto:', error);
    throw new Error(`Erro ao fazer upload: ${error.message}`);
  }

  // Obter URL pública
  const { data: urlData } = supabase.storage
    .from('guardas')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

