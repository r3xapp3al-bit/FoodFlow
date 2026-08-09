import { supabase } from '../config/supabase';
import type {
  CreateSiteInput,
  UpdateSiteInput,
  ListSitesQuery,
  CreateBranchInput,
  UpdateBranchInput,
  ListBranchesQuery,
} from '../schemas/sites.schema';

export class SitesService {
  // ── SITES ──────────────────────────────────────────────────────────

  async listSites(query: ListSitesQuery) {
    const { limit, offset, search, is_active } = query;

    let supabaseQuery = supabase.from('sites').select('*', { count: 'exact' });

    if (search) {
      supabaseQuery = supabaseQuery.or(`name.ilike.%${search}%,address.ilike.%${search}%`);
    }
    if (is_active !== undefined) {
      supabaseQuery = supabaseQuery.eq('is_active', is_active);
    }

    const { data, error, count } = await supabaseQuery
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Error al listar sites: ${error.message}`);

    return { data: data || [], total: count || 0, limit, offset };
  }

  async getSiteById(siteId: string) {
    const { data, error } = await supabase
      .from('sites')
      .select('*')
      .eq('id', siteId)
      .single();

    if (error) throw new Error(`Site no encontrado: ${error.message}`);
    return data;
  }

  async createSite(data: CreateSiteInput) {
    const { data: newSite, error } = await supabase
      .from('sites')
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(`Error al crear site: ${error.message}`);
    return newSite;
  }

  async updateSite(siteId: string, data: UpdateSiteInput) {
    const { data: updated, error } = await supabase
      .from('sites')
      .update(data)
      .eq('id', siteId)
      .select()
      .single();

    if (error) throw new Error(`Error al actualizar site: ${error.message}`);
    return updated;
  }

  async deleteSite(siteId: string) {
    // Soft delete (desactivar)
    const { error } = await supabase
      .from('sites')
      .update({ is_active: false })
      .eq('id', siteId);

    if (error) throw new Error(`Error al eliminar site: ${error.message}`);
    return { success: true, message: 'Site desactivado correctamente' };
  }

  // ── BRANCHES ──────────────────────────────────────────────────────

  async listBranches(query: ListBranchesQuery) {
    const { limit, offset, site_id, search, is_active } = query;

    let supabaseQuery = supabase.from('branches').select('*, sites(name)', { count: 'exact' });

    if (site_id) {
      supabaseQuery = supabaseQuery.eq('site_id', site_id);
    }
    if (search) {
      supabaseQuery = supabaseQuery.or(`name.ilike.%${search}%,address.ilike.%${search}%`);
    }
    if (is_active !== undefined) {
      supabaseQuery = supabaseQuery.eq('is_active', is_active);
    }

    const { data, error, count } = await supabaseQuery
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Error al listar branches: ${error.message}`);

    return { data: data || [], total: count || 0, limit, offset };
  }

  async getBranchById(branchId: string) {
    const { data, error } = await supabase
      .from('branches')
      .select('*, sites(name)')
      .eq('id', branchId)
      .single();

    if (error) throw new Error(`Branch no encontrada: ${error.message}`);
    return data;
  }

  async createBranch(data: CreateBranchInput) {
    const { data: newBranch, error } = await supabase
      .from('branches')
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(`Error al crear branch: ${error.message}`);
    return newBranch;
  }

  async updateBranch(branchId: string, data: UpdateBranchInput) {
    const { data: updated, error } = await supabase
      .from('branches')
      .update(data)
      .eq('id', branchId)
      .select()
      .single();

    if (error) throw new Error(`Error al actualizar branch: ${error.message}`);
    return updated;
  }

  async deleteBranch(branchId: string) {
    // Soft delete (desactivar)
    const { error } = await supabase
      .from('branches')
      .update({ is_active: false })
      .eq('id', branchId);

    if (error) throw new Error(`Error al eliminar branch: ${error.message}`);
    return { success: true, message: 'Branch desactivada correctamente' };
  }
}