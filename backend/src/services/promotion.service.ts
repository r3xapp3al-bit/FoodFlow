import { supabase } from '../config/supabase';
import { Promotion, PromotionCreate, PromotionUpdate, CouponUsageCreate } from '../models/promotion.model';
import type { ListPromotionsQuery } from '../schemas/promotions.schema';

export class PromotionService {
  // ── Promotions ──────────────────────────────────
  async listPromotions(siteId: string, query: ListPromotionsQuery) {
    const { limit, offset, codigo, type, is_active, start_date, end_date } = query;

    let supabaseQuery = supabase
      .from('promotions')
      .select('*, products(name, sku)', { count: 'exact' })
      .eq('site_id', siteId);

    if (codigo) supabaseQuery = supabaseQuery.ilike('codigo', `%${codigo}%`);
    if (type) supabaseQuery = supabaseQuery.eq('type', type);
    if (is_active !== undefined) supabaseQuery = supabaseQuery.eq('is_active', is_active);
    if (start_date) supabaseQuery = supabaseQuery.gte('start_date', start_date);
    if (end_date) supabaseQuery = supabaseQuery.lte('end_date', end_date);

    const { data, error, count } = await supabaseQuery
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Error al listar promociones: ${error.message}`);
    return { data: data || [], total: count || 0, limit, offset };
  }

  async getPromotionById(id: string): Promise<Promotion> {
    const { data, error } = await supabase
      .from('promotions')
      .select('*, products(name, sku)')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Promoción no encontrada: ${error.message}`);
    return data;
  }

  async createPromotion(payload: PromotionCreate & { site_id: string }): Promise<Promotion> {
    // Verificar que el código no exista
    const { data: existing, error: checkError } = await supabase
      .from('promotions')
      .select('codigo')
      .eq('codigo', payload.codigo)
      .eq('site_id', payload.site_id)
      .maybeSingle();

    if (checkError) throw new Error(`Error al verificar código: ${checkError.message}`);
    if (existing) throw new Error(`El código "${payload.codigo}" ya existe`);

    const { data, error } = await supabase
      .from('promotions')
      .insert({
        ...payload,
        is_active: payload.is_active ?? true,
        usage_per_customer: payload.usage_per_customer ?? 1,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error al crear promoción:', error);
      throw new Error(`Error al crear promoción: ${error.message}`);
    }
    return data;
  }

  async updatePromotion(id: string, payload: PromotionUpdate): Promise<Promotion> {
    const { data, error } = await supabase
      .from('promotions')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Error al actualizar promoción: ${error.message}`);
    return data;
  }

  async deletePromotion(id: string): Promise<{ success: boolean; message: string }> {
    // Verificar si tiene usos asociados
    const { count, error: countError } = await supabase
      .from('coupon_usage')
      .select('*', { count: 'exact', head: true })
      .eq('promotion_id', id);

    if (countError) throw new Error(countError.message);
    if (count && count > 0) {
      throw new Error('No se puede eliminar la promoción porque tiene usos asociados.');
    }

    const { error } = await supabase
      .from('promotions')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Error al eliminar promoción: ${error.message}`);
    return { success: true, message: 'Promoción eliminada correctamente' };
  }

  // ── Coupon Usage ────────────────────────────────
  async useCoupon(payload: CouponUsageCreate): Promise<{ success: boolean; message: string }> {
    // Verificar que la promoción existe y está activa
    const { data: promotion, error: promoError } = await supabase
      .from('promotions')
      .select('id, is_active, start_date, end_date, usage_per_customer')
      .eq('id', payload.promotion_id)
      .single();

    if (promoError) throw new Error(`Promoción no encontrada: ${promoError.message}`);
    if (!promotion.is_active) throw new Error('La promoción no está activa');

    const now = new Date().toISOString();
    if (promotion.start_date > now) throw new Error('La promoción aún no ha comenzado');
    if (promotion.end_date < now) throw new Error('La promoción ya ha expirado');

    // Verificar límite por cliente
    if (promotion.usage_per_customer) {
      const { count, error: countError } = await supabase
        .from('coupon_usage')
        .select('*', { count: 'exact', head: true })
        .eq('promotion_id', payload.promotion_id)
        .eq('customer_id', payload.customer_id);

      if (countError) throw new Error(countError.message);
      if (count && count >= promotion.usage_per_customer) {
        throw new Error(`Límite de uso por cliente alcanzado (máximo ${promotion.usage_per_customer})`);
      }
    }

    // Registrar el uso
    const { error: insertError } = await supabase
      .from('coupon_usage')
      .insert({
        promotion_id: payload.promotion_id,
        order_id: payload.order_id,
        customer_id: payload.customer_id,
        discount_applied: payload.discount_applied,
      });

    if (insertError) throw new Error(`Error al registrar uso del cupón: ${insertError.message}`);
    return { success: true, message: 'Cupón aplicado correctamente' };
  }

  async getCouponUsageByPromotion(promotionId: string) {
    const { data, error } = await supabase
      .from('coupon_usage')
      .select('*, orders(order_number), customers(name)')
      .eq('promotion_id', promotionId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Error al obtener usos del cupón: ${error.message}`);
    return data;
  }
}