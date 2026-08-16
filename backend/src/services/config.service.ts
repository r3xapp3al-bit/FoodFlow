import { supabase } from '../config/supabase';
import { Config, BranchConfig, ConfigCreate, ConfigUpdate, BranchConfigCreate, BranchConfigUpdate } from '../models/config.model';
import { ListConfigQuery, ListBranchConfigQuery } from '../schemas/config.schema';

export class ConfigService {
  // ─── Site Config ──────────────────────────────────
  async listConfigs(query: ListConfigQuery) {
    const { site_id, key, limit, offset } = query;
    let supabaseQuery = supabase.from('config').select('*', { count: 'exact' });

    if (site_id) supabaseQuery = supabaseQuery.eq('site_id', site_id);
    if (key) supabaseQuery = supabaseQuery.ilike('key', `%${key}%`);

    const { data, error, count } = await supabaseQuery
      .range(offset, offset + limit - 1)
      .order('key', { ascending: true });

    if (error) throw new Error(`Error al listar configuraciones: ${error.message}`);
    return { data: data || [], total: count || 0, limit, offset };
  }

  async getConfigById(id: string): Promise<Config> {
    const { data, error } = await supabase
      .from('config')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Configuración no encontrada: ${error.message}`);
    return data;
  }

  async getConfigByKey(siteId: string, key: string): Promise<Config | null> {
    const { data, error } = await supabase
      .from('config')
      .select('*')
      .eq('site_id', siteId)
      .eq('key', key)
      .maybeSingle();

    if (error) throw new Error(`Error al obtener configuración: ${error.message}`);
    return data;
  }

  async createConfig(payload: ConfigCreate): Promise<Config> {
    // Verificar que no exista clave duplicada para el sitio
    const existing = await this.getConfigByKey(payload.site_id, payload.key);
    if (existing) throw new Error(`La clave "${payload.key}" ya existe para este sitio`);

    const { data, error } = await supabase
      .from('config')
      .insert(payload)
      .select()
      .single();

    if (error) throw new Error(`Error al crear configuración: ${error.message}`);
    return data;
  }

  async updateConfig(id: string, payload: ConfigUpdate): Promise<Config> {
    const { data, error } = await supabase
      .from('config')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Error al actualizar configuración: ${error.message}`);
    return data;
  }

  async deleteConfig(id: string): Promise<{ success: boolean; message: string }> {
    const { error } = await supabase
      .from('config')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Error al eliminar configuración: ${error.message}`);
    return { success: true, message: 'Configuración eliminada correctamente' };
  }

  // ─── Branch Config ──────────────────────────────────
  async listBranchConfigs(query: ListBranchConfigQuery) {
    const { branch_id, key, limit, offset } = query;
    let supabaseQuery = supabase.from('branch_config').select('*', { count: 'exact' });

    if (branch_id) supabaseQuery = supabaseQuery.eq('branch_id', branch_id);
    if (key) supabaseQuery = supabaseQuery.ilike('key', `%${key}%`);

    const { data, error, count } = await supabaseQuery
      .range(offset, offset + limit - 1)
      .order('key', { ascending: true });

    if (error) throw new Error(`Error al listar configuraciones de sucursal: ${error.message}`);
    return { data: data || [], total: count || 0, limit, offset };
  }

  async getBranchConfigById(id: string): Promise<BranchConfig> {
    const { data, error } = await supabase
      .from('branch_config')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Configuración de sucursal no encontrada: ${error.message}`);
    return data;
  }

  async getBranchConfigByKey(branchId: string, key: string): Promise<BranchConfig | null> {
    const { data, error } = await supabase
      .from('branch_config')
      .select('*')
      .eq('branch_id', branchId)
      .eq('key', key)
      .maybeSingle();

    if (error) throw new Error(`Error al obtener configuración de sucursal: ${error.message}`);
    return data;
  }

  async createBranchConfig(payload: BranchConfigCreate): Promise<BranchConfig> {
    const existing = await this.getBranchConfigByKey(payload.branch_id, payload.key);
    if (existing) throw new Error(`La clave "${payload.key}" ya existe para esta sucursal`);

    const { data, error } = await supabase
      .from('branch_config')
      .insert(payload)
      .select()
      .single();

    if (error) throw new Error(`Error al crear configuración de sucursal: ${error.message}`);
    return data;
  }

  async updateBranchConfig(id: string, payload: BranchConfigUpdate): Promise<BranchConfig> {
    const { data, error } = await supabase
      .from('branch_config')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Error al actualizar configuración de sucursal: ${error.message}`);
    return data;
  }

  async deleteBranchConfig(id: string): Promise<{ success: boolean; message: string }> {
    const { error } = await supabase
      .from('branch_config')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Error al eliminar configuración de sucursal: ${error.message}`);
    return { success: true, message: 'Configuración de sucursal eliminada correctamente' };
  }
}