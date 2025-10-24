import { supabase } from './supabase'
import { Servico } from '../types/servicos'

// Interface para inserir serviço no catálogo
export interface ServicoCatalogoInsert {
  nome: string
  descricao?: string
  tipo: string
  unidade_padrao: string
  preco_base?: number
  ativo?: boolean
}

// Buscar todos os serviços ativos do catálogo
export async function getServicosCatalogo(): Promise<Servico[]> {
  const { data, error } = await supabase
    .from('servicos_catalogo')
    .select('*')
    .eq('ativo', true)
    .is('deleted_at', null)
    .order('nome', { ascending: true })

  if (error) {
    console.error('Erro ao buscar serviços do catálogo:', error)
    throw new Error(`Erro ao buscar serviços do catálogo: ${error.message}`)
  }

  return data.map(servico => ({
    id: servico.id,
    nome: servico.nome,
    descricao: servico.descricao,
    tipo: servico.tipo,
    unidade_padrao: servico.unidade_padrao,
    preco_base: servico.preco_base,
    ativo: servico.ativo,
    created_at: servico.created_at
  }))
}

// Buscar um serviço do catálogo pelo ID
export async function getServicoCatalogoById(id: string): Promise<Servico | null> {
  const { data, error } = await supabase
    .from('servicos_catalogo')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // Serviço não encontrado
      return null
    }
    console.error('Erro ao buscar serviço do catálogo:', error)
    throw new Error(`Erro ao buscar serviço do catálogo: ${error.message}`)
  }

  return {
    id: data.id,
    nome: data.nome,
    descricao: data.descricao,
    tipo: data.tipo,
    unidade_padrao: data.unidade_padrao,
    preco_base: data.preco_base,
    ativo: data.ativo,
    created_at: data.created_at
  }
}

// Criar um novo serviço no catálogo
export async function createServicoCatalogo(servico: ServicoCatalogoInsert): Promise<Servico> {
  const { data, error } = await supabase
    .from('servicos_catalogo')
    .insert([servico])
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar serviço no catálogo:', error)
    throw new Error(`Erro ao criar serviço no catálogo: ${error.message}`)
  }

  return {
    id: data.id,
    nome: data.nome,
    descricao: data.descricao,
    tipo: data.tipo,
    unidade_padrao: data.unidade_padrao,
    preco_base: data.preco_base,
    ativo: data.ativo,
    created_at: data.created_at
  }
}

// Atualizar um serviço no catálogo
export async function updateServicoCatalogo(id: string, servico: Partial<ServicoCatalogoInsert>): Promise<Servico> {
  const { data, error } = await supabase
    .from('servicos_catalogo')
    .update(servico)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar serviço no catálogo:', error)
    throw new Error(`Erro ao atualizar serviço no catálogo: ${error.message}`)
  }

  return {
    id: data.id,
    nome: data.nome,
    descricao: data.descricao,
    tipo: data.tipo,
    unidade_padrao: data.unidade_padrao,
    preco_base: data.preco_base,
    ativo: data.ativo,
    created_at: data.created_at
  }
}

// Deletar um serviço do catálogo (soft delete)
export async function deleteServicoCatalogo(id: string): Promise<void> {
  const { error } = await supabase
    .from('servicos_catalogo')
    .update({ deleted_at: new Date().toISOString(), ativo: false })
    .eq('id', id)

  if (error) {
    console.error('Erro ao deletar serviço do catálogo:', error)
    throw new Error(`Erro ao deletar serviço do catálogo: ${error.message}`)
  }
}

