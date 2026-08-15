import { supabase } from '../config/supabase';
import { Wastage, WastageCreate } from '../models/wastage.model';
import { ListWastagesQuery } from '../schemas/wastages.schema';

export class WastageService {
  async listWastages(query: ListWastagesQuery) {
    const { supply_id, branch_id, reason, limit, offset } = query;
    let supabaseQuery = supabase.from('wastages').select('*, supplies(name), branches(name), users(display_name)', { count: 'exact' });

    if (supply_id) supabaseQuery = supabaseQuery.eq('supply_id', supply_id);
    if (branch_id) supabaseQuery = supabaseQuery.eq('branch_id', branch_id);
    if (reason) supabaseQuery = supabaseQuery.eq('reason', reason);

    const { data, error, count } = await supabaseQuery
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Error al listar mermas: ${error.message}`);
    return { data: data || [], total: count || 0, limit, offset };
  }

  async getWastageById(id: string): Promise<Wastage> {
    const { data, error } = await supabase
      .from('wastages')
      .select('*, supplies(name), branches(name), users(display_name)')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Merma no encontrada: ${error.message}`);
    return data;
  }

  async createWastage(payload: WastageCreate): Promise<Wastage> {
    // Verificar que el insumo existe (solo necesitamos el error)
    const { error: supplyError } = await supabase
      .from('supplies')
      .select('id')
      .eq('id', payload.supply_id)
      .single();

    if (supplyError) throw new Error('Insumo no encontrado');

    // Si hay batch_id, verificar que exista y pertenezca al insumo
    if (payload.batch_id) {
      const { data: batch, error: batchError } = await supabase
        .from('batches')
        .select('id, insumo_id, current_quantity')
        .eq('id', payload.batch_id)
        .single();

      if (batchError) throw new Error('Lote no encontrado');
      if (batch.insumo_id !== payload.supply_id) throw new Error('El lote no corresponde al insumo');
      if (Number(batch.current_quantity) < payload.quantity) {
        throw new Error(`Cantidad insuficiente en el lote (disponible: ${batch.current_quantity})`);
      }

      // Actualizar el lote restando la cantidad
      const { error: updateBatchError } = await supabase
        .from('batches')
        .update({ current_quantity: Number(batch.current_quantity) - payload.quantity })
        .eq('id', payload.batch_id);

      if (updateBatchError) throw new Error(`Error al actualizar lote: ${updateBatchError.message}`);
    }

    // Registrar la merma
    const { data, error } = await supabase
      .from('wastages')
      .insert(payload)
      .select()
      .single();

    if (error) throw new Error(`Error al crear merma: ${error.message}`);

    // Registrar un movimiento de inventario (SALIDA por MERMA)
    const { error: movementError } = await supabase
      .from('inventory_movements')
      .insert({
        insumo_id: payload.supply_id,
        branch_id: payload.branch_id,
        batch_id: payload.batch_id,
        quantity: payload.quantity,
        type: 'MERMA',
        reason: payload.reason,
        reference_id: data.id,
        user_id: payload.registered_by,
      });

    if (movementError) {
      console.error('Error al registrar movimiento de inventario:', movementError);
      // No lanzamos error para no romper la transacción, pero podríamos revertir
    }

    return data;
  }
}