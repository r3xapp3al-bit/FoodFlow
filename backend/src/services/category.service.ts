import { supabase } from '../config/supabase';
import { Category, CategoryCreate, CategoryUpdate } from '../models/category.model';
import type { ListCategoriesQuery } from '../schemas/categories.schema';

export class CategoryService {
  async listCategories(siteId: string, query: ListCategoriesQuery) {
    const { limit, offset, search, is_active } = query;

    let supabaseQuery = supabase
      .from('categories')
      .select('*', { count: 'exact' })
      .eq('site_id', siteId);

    if (search) {
      supabaseQuery = supabaseQuery.ilike('name', `%${search}%`);
    }
    if (is_active !== undefined) {
      supabaseQuery = supabaseQuery.eq('is_active', is_active);
    }

    const { data, error, count } = await supabaseQuery
      .range(offset, offset + limit - 1)
      .order('sort_order', { ascending: true })
      .order('name');

    if (error) throw new Error(`Error al listar categorías: ${error.message}`);
    return { data: data || [], total: count || 0, limit, offset };
  }

  async getCategoryById(id: string): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Categoría no encontrada: ${error.message}`);
    return data;
  }

  async createCategory(payload: CategoryCreate & { site_id: string }): Promise<Category> {
    // 🔍 Log para depuración
    console.log('📦 Payload recibido en createCategory:', JSON.stringify(payload, null, 2));

    // Validar que site_id esté presente
    if (!payload.site_id) {
      throw new Error('site_id es requerido para crear una categoría');
    }

    // Construir el objeto a insertar (solo campos necesarios)
    const insertPayload = {
      name: payload.name,
      description: payload.description || null,
      site_id: payload.site_id,
      is_active: payload.is_active ?? true,
      sort_order: payload.sort_order ?? 0,
    };

    const { data, error } = await supabase
      .from('categories')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('❌ Error completo de Supabase (insert category):', JSON.stringify(error, null, 2));
      throw new Error(`Error al crear categoría: ${error.message}`);
    }
    return data;
  }

  async updateCategory(id: string, payload: CategoryUpdate): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Error completo de Supabase (update category):', JSON.stringify(error, null, 2));
      throw new Error(`Error al actualizar categoría: ${error.message}`);
    }
    return data;
  }

  async deleteCategory(id: string): Promise<{ success: boolean; message: string }> {
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id);

    if (countError) throw new Error(countError.message);
    if (count && count > 0) {
      throw new Error('No se puede eliminar la categoría porque tiene productos asociados.');
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error completo de Supabase (delete category):', JSON.stringify(error, null, 2));
      throw new Error(`Error al eliminar categoría: ${error.message}`);
    }
    return { success: true, message: 'Categoría eliminada correctamente' };
  }
}