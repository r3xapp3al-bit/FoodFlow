import { supabase } from '../config/supabase';
import {
  Inventory,
  InventoryUpdate,
  Batch,
  BatchCreate,
  BatchUpdate,
  InventoryMovement,
  InventoryMovementCreate,
} from '../models/inventory.model';
import type {
  ListInventoryQuery,
  ListBatchesQuery,
  ListMovementsQuery,
} from '../schemas/inventory.schema';

export class InventoryService {
  // ── Inventory ───────────────────────────────
  async listInventory(siteId: string, query: ListInventoryQuery) {
    const { limit, offset, branch_id, insumo_id } = query;

    let supabaseQuery = supabase
      .from('inventory')
      .select(`
        *,
        supplies(name, unit),
        branches(name)
      `, { count: 'exact' })
      .eq('supplies.site_id', siteId);

    if (branch_id) supabaseQuery = supabaseQuery.eq('branch_id', branch_id);
    if (insumo_id) supabaseQuery = supabaseQuery.eq('insumo_id', insumo_id);

    const { data, error, count } = await supabaseQuery
      .range(offset, offset + limit - 1)
      .order('name', { ascending: true, foreignTable: 'supplies' }); // ✅ Corrección final

    if (error) throw new Error(`Error al listar inventario: ${error.message}`);
    return { data: data || [], total: count || 0, limit, offset };
  }

  async updateInventory(
    insumoId: string,
    branchId: string,
    payload: InventoryUpdate
  ): Promise<Inventory> {
    const { data, error } = await supabase
      .from('inventory')
      .update(payload)
      .eq('insumo_id', insumoId)
      .eq('branch_id', branchId)
      .select()
      .single();

    if (error) throw new Error(`Error al actualizar inventario: ${error.message}`);
    return data;
  }

  // ── Batches ──────────────────────────────────
  async listBatches(siteId: string, query: ListBatchesQuery) {
    const { limit, offset, insumo_id, branch_id } = query;

    let supabaseQuery = supabase
      .from('batches')
      .select(`
        *,
        supplies(name, unit),
        branches(name)
      `, { count: 'exact' })
      .eq('supplies.site_id', siteId);

    if (insumo_id) supabaseQuery = supabaseQuery.eq('insumo_id', insumo_id);
    if (branch_id) supabaseQuery = supabaseQuery.eq('branch_id', branch_id);

    const { data, error, count } = await supabaseQuery
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Error al listar lotes: ${error.message}`);
    return { data: data || [], total: count || 0, limit, offset };
  }

  async getBatchById(id: string): Promise<Batch> {
    const { data, error } = await supabase
      .from('batches')
      .select('*, supplies(name, unit), branches(name)')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Lote no encontrado: ${error.message}`);
    return data;
  }

  async createBatch(payload: BatchCreate): Promise<Batch> {
    const { data, error } = await supabase
      .from('batches')
      .insert({
        ...payload,
        current_quantity: payload.current_quantity ?? payload.initial_quantity,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error al crear lote:', error);
      throw new Error(`Error al crear lote: ${error.message}`);
    }

    // Registrar movimiento de entrada automático
    try {
      const movementPayload: InventoryMovementCreate = {
        insumo_id: payload.insumo_id,
        branch_id: payload.branch_id,
        batch_id: data.id,
        quantity: payload.initial_quantity,
        type: 'ENTRADA',
        reason: 'Creación de lote',
      };

      await this.createMovement(movementPayload);
    } catch (movementError) {
      console.error('⚠️ Lote creado pero falló el movimiento automático:', movementError);
    }

    return data;
  }

  async updateBatch(id: string, payload: BatchUpdate): Promise<Batch> {
    const { data, error } = await supabase
      .from('batches')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Error al actualizar lote: ${error.message}`);
    return data;
  }

  async deleteBatch(id: string): Promise<{ success: boolean; message: string }> {
    const { count, error: countError } = await supabase
      .from('inventory_movements')
      .select('*', { count: 'exact', head: true })
      .eq('batch_id', id);

    if (countError) throw new Error(countError.message);
    if (count && count > 0) {
      throw new Error('No se puede eliminar el lote porque tiene movimientos asociados.');
    }

    const { error } = await supabase
      .from('batches')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Error al eliminar lote: ${error.message}`);
    return { success: true, message: 'Lote eliminado correctamente' };
  }

  // ── Movements ───────────────────────────────
  async listMovements(siteId: string, query: ListMovementsQuery) {
    const { limit, offset, insumo_id, branch_id, type } = query;

    let supabaseQuery = supabase
      .from('inventory_movements')
      .select(`
        *,
        supplies(name, unit),
        branches(name),
        batches(lot_number),
        users(display_name)
      `, { count: 'exact' })
      .eq('supplies.site_id', siteId);

    if (insumo_id) supabaseQuery = supabaseQuery.eq('insumo_id', insumo_id);
    if (branch_id) supabaseQuery = supabaseQuery.eq('branch_id', branch_id);
    if (type) supabaseQuery = supabaseQuery.eq('type', type);

    const { data, error, count } = await supabaseQuery
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Error al listar movimientos: ${error.message}`);
    return { data: data || [], total: count || 0, limit, offset };
  }

  async createMovement(payload: InventoryMovementCreate): Promise<InventoryMovement> {
    const { data, error } = await supabase
      .from('inventory_movements')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('❌ Error al insertar movimiento:', error);
      throw new Error(`Error al registrar movimiento: ${error.message}`);
    }

    // Actualizar stock usando la función RPC
    try {
      const sign = payload.type === 'ENTRADA' || payload.type === 'TRANSFERENCIA_ENTRADA' ? 1 : -1;
      const quantity = payload.quantity * sign;

      const { error: updateError } = await supabase.rpc('update_inventory_stock', {
        p_insumo_id: payload.insumo_id,
        p_branch_id: payload.branch_id,
        p_quantity: quantity,
      });

      if (updateError) {
        console.error('⚠️ Movimiento registrado pero falló actualización de stock:', updateError);
      }
    } catch (stockError) {
      console.error('⚠️ Error al actualizar stock:', stockError);
    }

    return data;
  }
}