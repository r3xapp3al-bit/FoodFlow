import { supabase } from '../config/supabase';
import {
  Customer,
  CustomerCreate,
  CustomerUpdate,
  CustomerAddress,
  AddressCreate,
  AddressUpdate,
} from '../models/customer.model';
import type { ListCustomersQuery } from '../schemas/customers.schema';

export class CustomerService {
  // ── Customers ────────────────────────────────────────
  async listCustomers(_siteId: string, query: ListCustomersQuery) {
    const { limit, offset, search, email } = query;

    let supabaseQuery = supabase
      .from('customers')
      .select('*', { count: 'exact' });

    if (search) {
      supabaseQuery = supabaseQuery.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }
    if (email) {
      supabaseQuery = supabaseQuery.eq('email', email);
    }

    const { data, error, count } = await supabaseQuery
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Error al listar clientes: ${error.message}`);
    return { data: data || [], total: count || 0, limit, offset };
  }

  async getCustomerById(id: string): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(`Cliente no encontrado: ${error.message}`);
    return data;
  }

  async createCustomer(payload: CustomerCreate): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('❌ Error al crear cliente:', error);
      throw new Error(`Error al crear cliente: ${error.message}`);
    }
    return data;
  }

  async updateCustomer(id: string, payload: CustomerUpdate): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Error al actualizar cliente: ${error.message}`);
    return data;
  }

  async deleteCustomer(id: string): Promise<{ success: boolean; message: string }> {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Error al eliminar cliente: ${error.message}`);
    return { success: true, message: 'Cliente eliminado correctamente' };
  }

  // ── Addresses ─────────────────────────────────────────
  async listAddresses(customerId: string) {
    const { data, error } = await supabase
      .from('customer_addresses')
      .select('*')
      .eq('customer_id', customerId)
      .order('is_default', { ascending: false });

    if (error) throw new Error(`Error al listar direcciones: ${error.message}`);
    return data;
  }

  async createAddress(payload: AddressCreate): Promise<CustomerAddress> {
    if (payload.is_default) {
      await supabase
        .from('customer_addresses')
        .update({ is_default: false })
        .eq('customer_id', payload.customer_id);
    }

    const { data, error } = await supabase
      .from('customer_addresses')
      .insert(payload)
      .select()
      .single();

    if (error) throw new Error(`Error al crear dirección: ${error.message}`);
    return data;
  }

  async updateAddress(id: string, payload: AddressUpdate, customerId?: string): Promise<CustomerAddress> {
    if (payload.is_default && customerId) {
      await supabase
        .from('customer_addresses')
        .update({ is_default: false })
        .eq('customer_id', customerId);
    }

    const { data, error } = await supabase
      .from('customer_addresses')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Error al actualizar dirección: ${error.message}`);
    return data;
  }

  async deleteAddress(id: string): Promise<{ success: boolean; message: string }> {
    const { error } = await supabase
      .from('customer_addresses')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Error al eliminar dirección: ${error.message}`);
    return { success: true, message: 'Dirección eliminada correctamente' };
  }
}