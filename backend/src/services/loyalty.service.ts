import { supabase } from '../config/supabase';
import { LoyaltyPoints, PointHistoryCreate } from '../models/loyalty.model'; // elimino PointHistory
import { AddPointsInput, RedeemPointsInput } from '../schemas/loyalty.schema';

export class LoyaltyService {
  async getLoyaltyByCustomer(customerId: string): Promise<LoyaltyPoints> {
    const { data, error } = await supabase
      .from('loyalty_points')
      .select('*')
      .eq('customer_id', customerId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Error al obtener puntos: ${error.message}`);
    }

    if (!data) {
      const { data: newData, error: createError } = await supabase
        .from('loyalty_points')
        .insert({
          customer_id: customerId,
          points: 0,
          accumulated_points: 0,
          redeemed_points: 0,
        })
        .select()
        .single();

      if (createError) throw new Error(`Error al crear puntos: ${createError.message}`);
      return newData;
    }

    return data;
  }

  async getPointHistory(customerId: string, limit: number = 20, offset: number = 0) {
    const { data, error, count } = await supabase
      .from('point_history')
      .select('*', { count: 'exact' })
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(`Error al obtener historial: ${error.message}`);
    return { data: data || [], total: count || 0, limit, offset };
  }

  async addPoints(payload: AddPointsInput & { customer_id: string }): Promise<LoyaltyPoints> {
    const { customer_id, points, concept, reference_id } = payload;

    const loyalty = await this.getLoyaltyByCustomer(customer_id);

    const newPoints = Number(loyalty.points) + points;
    const newAccumulated = Number(loyalty.accumulated_points) + points;

    const { data, error } = await supabase
      .from('loyalty_points')
      .update({
        points: newPoints,
        accumulated_points: newAccumulated,
      })
      .eq('id', loyalty.id)
      .select()
      .single();

    if (error) throw new Error(`Error al agregar puntos: ${error.message}`);

    const historyPayload: PointHistoryCreate = {
      customer_id: customer_id,
      points: points,
      concept: concept,
      reference_id: reference_id,
    };

    const { error: histError } = await supabase
      .from('point_history')
      .insert(historyPayload);

    if (histError) console.error('Error al registrar historial:', histError);

    return data;
  }

  async redeemPoints(payload: RedeemPointsInput & { customer_id: string }): Promise<LoyaltyPoints> {
    const { customer_id, points, concept, reference_id } = payload;

    const loyalty = await this.getLoyaltyByCustomer(customer_id);

    if (Number(loyalty.points) < points) {
      throw new Error(`Puntos insuficientes. Disponibles: ${loyalty.points}`);
    }

    const newPoints = Number(loyalty.points) - points;
    const newRedeemed = Number(loyalty.redeemed_points) + points;

    const { data, error } = await supabase
      .from('loyalty_points')
      .update({
        points: newPoints,
        redeemed_points: newRedeemed,
      })
      .eq('id', loyalty.id)
      .select()
      .single();

    if (error) throw new Error(`Error al canjear puntos: ${error.message}`);

    const historyPayload: PointHistoryCreate = {
      customer_id: customer_id,
      points: -points,
      concept: concept,
      reference_id: reference_id,
    };

    const { error: histError } = await supabase
      .from('point_history')
      .insert(historyPayload);

    if (histError) console.error('Error al registrar historial:', histError);

    return data;
  }
}