import { supabase } from '../config/supabase';
import { Supply, SupplyCreate, SupplyUpdate } from '../models/supply.model';
import type { ListSuppliesQuery } from '../schemas/supplies.schema';

export class SupplyService {
  async listSupplies(siteId: string, query: ListSuppliesQuery) {
    const { limit, offset, search } = query; // quitamos is_active

    let supabaseQuery = supabase
      .from('supplies')
      .select('*', { count: 'exact' })
      .eq('site_id', siteId);

    if (search) {
      supabaseQuery = supabaseQuery.ilike('name', `%${search}%`);
    }
    // Eliminamos filtro por is_active porque no existe la columna

    const { data, error, count } = await supabaseQuery
      .range(offset, offset + limit - 1)
      .order('name');

    if (error) throw new Error(`Error al listar insumos: ${error.message}`);
    return { data: data || [], total: count || 0, limit, offset };
  }

  async getSupplyById(id: string): Promise<Supply> {
    const { data, error } = await supabase
      .from('supplies')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Insumo no encontrado: ${error.message}`);
    return data;
  }

  async createSupply(payload: SupplyCreate & { site_id: string }): Promise<Supply> {
    // Eliminamos is_active, solo insertamos los campos que existen
    const insertPayload = {
      name: payload.name,
      unit: payload.unit,
      site_id: payload.site_id,
      min_stock: payload.min_stock ?? 0,
      unit_cost: payload.unit_cost ?? 0,
      is_perishable: payload.is_perishable ?? true,
    };

    const { data, error } = await supabase
      .from('supplies')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('❌ Error completo de Supabase (insert supply):', JSON.stringify(error, null, 2));
      throw new Error(`Error al crear insumo: ${error.message}`);
    }
    return data;
  }

  async updateSupply(id: string, payload: SupplyUpdate): Promise<Supply> {
    // Solo actualizamos campos que existen
    const updatePayload: any = {};
    if (payload.name !== undefined) updatePayload.name = payload.name;
    if (payload.unit !== undefined) updatePayload.unit = payload.unit;
    if (payload.min_stock !== undefined) updatePayload.min_stock = payload.min_stock;
    if (payload.unit_cost !== undefined) updatePayload.unit_cost = payload.unit_cost;
    if (payload.is_perishable !== undefined) updatePayload.is_perishable = payload.is_perishable;

    const { data, error } = await supabase
      .from('supplies')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error completo de Supabase (update supply):', JSON.stringify(error, null, 2));
      throw new Error(`Error al actualizar insumo: ${error.message}`);
    }
    return data;
  }

  async deleteSupply(id: string): Promise<{ success: boolean; message: string }> {
    const { error } = await supabase
      .from('supplies')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error completo de Supabase (delete supply):', JSON.stringify(error, null, 2));
      throw new Error(`Error al eliminar insumo: ${error.message}`);
    }
    return { success: true, message: 'Insumo eliminado correctamente' };
  }
}