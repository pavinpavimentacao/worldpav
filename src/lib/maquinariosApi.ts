/**
 * API para gerenciamento de maquinários
 */

import { supabase } from './supabase';
import type { 
  Maquinario, 
  CreateMaquinarioData, 
  UpdateMaquinarioData, 
  MaquinarioFilters, 
  MaquinarioStats 
} from '../types/maquinarios';

export class MaquinariosAPI {
  /**
   * Lista maquinários com filtros opcionais
   */
  static async list(filters?: MaquinarioFilters): Promise<Maquinario[]> {
    let query = supabase
      .from('maquinarios')
      .select('*')
      .is('deleted_at', null)
      .order('name');

    if (filters) {
      if (filters.company_id) {
        query = query.eq('company_id', filters.company_id);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,plate.ilike.%${filters.search}%,model.ilike.%${filters.search}%`);
      }
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao listar maquinários: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Busca maquinário por ID
   */
  static async getById(id: string): Promise<Maquinario | null> {
    const { data, error } = await supabase
      .from('maquinarios')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Não encontrado
      }
      throw new Error(`Erro ao buscar maquinário: ${error.message}`);
    }

    return data;
  }

  /**
   * Cria novo maquinário
   */
  static async create(data: CreateMaquinarioData, companyId: string): Promise<Maquinario> {
    const maquinarioData = {
      ...data,
      company_id: companyId,
      status: data.status || 'ativo'
    };

    const { data: maquinario, error } = await supabase
      .from('maquinarios')
      .insert([maquinarioData])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar maquinário: ${error.message}`);
    }

    return maquinario;
  }

  /**
   * Atualiza maquinário existente
   */
  static async update(id: string, data: Partial<CreateMaquinarioData>): Promise<Maquinario> {
    const { data: maquinario, error } = await supabase
      .from('maquinarios')
      .update(data)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar maquinário: ${error.message}`);
    }

    return maquinario;
  }

  /**
   * Remove maquinário (soft delete)
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('maquinarios')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao remover maquinário: ${error.message}`);
    }
  }

  /**
   * Busca maquinários ativos para programação
   */
  static async getAtivos(companyId?: string): Promise<Maquinario[]> {
    let query = supabase
      .from('maquinarios')
      .select('*')
      .eq('status', 'ativo')
      .is('deleted_at', null)
      .order('name');

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar maquinários ativos: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Busca estatísticas dos maquinários
   */
  static async getStats(companyId?: string): Promise<MaquinarioStats> {
    let query = supabase
      .from('maquinarios')
      .select('status, type')
      .is('deleted_at', null);

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
    }

    const maquinarios = data || [];
    
    const stats: MaquinarioStats = {
      total: maquinarios.length,
      ativos: maquinarios.filter(m => m.status === 'ativo').length,
      manutencao: maquinarios.filter(m => m.status === 'manutencao').length,
      inativos: maquinarios.filter(m => m.status === 'inativo').length,
      porTipo: {}
    };

    // Contar por tipo
    maquinarios.forEach(maquinario => {
      const tipo = maquinario.type || 'Não especificado';
      stats.porTipo[tipo] = (stats.porTipo[tipo] || 0) + 1;
    });

    return stats;
  }

  /**
   * Busca maquinários por tipo
   */
  static async getByType(type: string, companyId?: string): Promise<Maquinario[]> {
    let query = supabase
      .from('maquinarios')
      .select('*')
      .eq('type', type)
      .is('deleted_at', null)
      .order('name');

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar maquinários por tipo: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Verifica se placa já existe
   */
  static async checkPlateExists(plate: string, companyId: string, excludeId?: string): Promise<boolean> {
    let query = supabase
      .from('maquinarios')
      .select('id')
      .eq('plate', plate)
      .eq('company_id', companyId)
      .is('deleted_at', null);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao verificar placa: ${error.message}`);
    }

    return (data || []).length > 0;
  }

  /**
   * Busca maquinários para dropdown/select
   */
  static async getForSelect(companyId?: string): Promise<Array<{ id: string; name: string; type?: string; plate?: string }>> {
    const maquinarios = await this.getAtivos(companyId);
    
    return maquinarios.map(maq => ({
      id: maq.id,
      name: maq.name,
      type: maq.type,
      plate: maq.plate
    }));
  }
}

// Hook para subscriptions em tempo real será implementado futuramente
