import { supabase } from '../config/supabase';
import { Product, ProductCreate, ProductUpdate } from '../models/product.model';
import type { ListProductsQuery } from '../schemas/products.schema';

export class ProductService {
  async listProducts(siteId: string, query: ListProductsQuery) {
    const { limit, offset, search, category_id, is_active } = query;

    let supabaseQuery = supabase
      .from('products')
      .select('*, category:categories(id, name)', { count: 'exact' })
      .eq('site_id', siteId);

    if (search) {
      supabaseQuery = supabaseQuery.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
    }
    if (category_id) {
      supabaseQuery = supabaseQuery.eq('category_id', category_id);
    }
    if (is_active !== undefined) {
      supabaseQuery = supabaseQuery.eq('is_active', is_active);
    }

    const { data, error, count } = await supabaseQuery
      .range(offset, offset + limit - 1)
      .order('name');

    if (error) throw new Error(`Error al listar productos: ${error.message}`);
    return { data: data || [], total: count || 0, limit, offset };
  }

  async getProductById(id: string): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(id, name)')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Producto no encontrado: ${error.message}`);
    return data;
  }

  async createProduct(payload: ProductCreate & { site_id: string }): Promise<Product> {
    const cleanPayload = {
      ...payload,
      is_active: payload.is_active ?? true,
      image_url: payload.image_url === null ? undefined : payload.image_url,
    };
    const { data, error } = await supabase
      .from('products')
      .insert(cleanPayload)
      .select()
      .single();

    // ✅ LOG DE DEPURACIÓN
    if (error) {
      console.error('❌ Error completo de Supabase (insert product):', JSON.stringify(error, null, 2));
      throw new Error(`Error al crear producto: ${error.message}`);
    }
    return data;
  }

  async updateProduct(id: string, payload: ProductUpdate): Promise<Product> {
    const cleanPayload = {
      ...payload,
      image_url: payload.image_url === null ? undefined : payload.image_url,
    };
    const { data, error } = await supabase
      .from('products')
      .update(cleanPayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error completo de Supabase (update product):', JSON.stringify(error, null, 2));
      throw new Error(`Error al actualizar producto: ${error.message}`);
    }
    return data;
  }

  async deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error completo de Supabase (delete product):', JSON.stringify(error, null, 2));
      throw new Error(`Error al eliminar producto: ${error.message}`);
    }
    return { success: true, message: 'Producto eliminado correctamente' };
  }
}