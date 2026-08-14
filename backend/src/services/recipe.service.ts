import { supabase } from '../config/supabase';
import { Recipe, RecipeCreate, RecipeUpdate } from '../models/recipe.model';
import type { ListRecipesQuery } from '../schemas/recipes.schema';

export class RecipeService {
  async listRecipes(siteId: string, query: ListRecipesQuery) {
    const { limit, offset, product_id, supply_id } = query;

    let supabaseQuery = supabase
      .from('recipes')
      .select(`
        *,
        products(name, sku),
        supplies(name, unit)
      `, { count: 'exact' })
      .eq('products.site_id', siteId);

    if (product_id) supabaseQuery = supabaseQuery.eq('product_id', product_id);
    if (supply_id) supabaseQuery = supabaseQuery.eq('supply_id', supply_id);

    const { data, error, count } = await supabaseQuery
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Error al listar recetas: ${error.message}`);
    return { data: data || [], total: count || 0, limit, offset };
  }

  async getRecipeById(id: string): Promise<Recipe> {
    const { data, error } = await supabase
      .from('recipes')
      .select('*, products(name, sku), supplies(name, unit)')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Receta no encontrada: ${error.message}`);
    return data;
  }

  async createRecipe(payload: RecipeCreate): Promise<Recipe> {
    const { data, error } = await supabase
      .from('recipes')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('❌ Error al crear receta:', error);
      throw new Error(`Error al crear receta: ${error.message}`);
    }
    return data;
  }

  async updateRecipe(id: string, payload: RecipeUpdate): Promise<Recipe> {
    const { data, error } = await supabase
      .from('recipes')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Error al actualizar receta: ${error.message}`);
    return data;
  }

  async deleteRecipe(id: string): Promise<{ success: boolean; message: string }> {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Error al eliminar receta: ${error.message}`);
    return { success: true, message: 'Receta eliminada correctamente' };
  }
}