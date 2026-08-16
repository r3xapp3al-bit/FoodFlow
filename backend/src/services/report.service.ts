import { supabase } from '../config/supabase';

export class ReportService {
  // Ventas del día (por sitio o global)
  async getDailySales(siteId?: string) {
    const today = new Date().toISOString().split('T')[0];
    let query = supabase
      .from('orders')
      .select('total, created_at')
      .gte('created_at', `${today}T00:00:00Z`)
      .lt('created_at', `${today}T23:59:59Z`)
      .eq('status', 'ENTREGADO');

    if (siteId) {
      query = query.eq('site_id', siteId);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Error al obtener ventas diarias: ${error.message}`);

    const totalSales = data.reduce((acc, order) => acc + Number(order.total), 0);
    const orderCount = data.length;

    return {
      date: today,
      totalSales,
      orderCount,
      averageTicket: orderCount > 0 ? totalSales / orderCount : 0,
    };
  }

  // Ventas por período (día, semana, mes)
  async getSalesByPeriod(siteId?: string, start?: string, end?: string, period?: 'day' | 'week' | 'month') {
    let query = supabase
      .from('orders')
      .select('total, created_at')
      .eq('status', 'ENTREGADO');

    if (siteId) {
      query = query.eq('site_id', siteId);
    }

    if (start) {
      query = query.gte('created_at', start);
    }
    if (end) {
      query = query.lte('created_at', end);
    }

    // Si no se especifica start/end, usar período
    if (!start && !end && period) {
      const now = new Date();
      let startDate = new Date();
      switch (period) {
        case 'day':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - now.getDay());
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'month':
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          break;
      }
      query = query.gte('created_at', startDate.toISOString());
    }

    const { data, error } = await query.order('created_at', { ascending: true });
    if (error) throw new Error(`Error al obtener ventas por período: ${error.message}`);

    const totalSales = data.reduce((acc, order) => acc + Number(order.total), 0);
    const orderCount = data.length;

    return {
      period: period || 'custom',
      totalSales,
      orderCount,
      averageTicket: orderCount > 0 ? totalSales / orderCount : 0,
      data,
    };
  }

  // Stock actual por sitio (o global)
  async getCurrentInventory(siteId?: string) {
    let query = supabase.from('inventory').select(`
      id,
      available_stock,
      reserved_stock,
      stock_total,
      reorder_point,
      supplies(name, unit, site_id)
    `);

    if (siteId) {
      query = query.eq('supplies.site_id', siteId);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Error al obtener inventario: ${error.message}`);

    return data.map(item => ({
      ...item,
      supplies: Array.isArray(item.supplies) ? item.supplies[0] : item.supplies
    }));
  }

  // Productos con bajo stock
  async getLowStockProducts(siteId?: string, threshold: number = 10) {
    let query = supabase
      .from('inventory')
      .select(`
        id,
        available_stock,
        stock_total,
        reorder_point,
        supplies(name, unit, site_id)
      `)
      .lt('stock_total', threshold);

    if (siteId) {
      query = query.eq('supplies.site_id', siteId);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Error al obtener productos con bajo stock: ${error.message}`);

    return data.map(item => ({
      ...item,
      supplies: Array.isArray(item.supplies) ? item.supplies[0] : item.supplies
    }));
  }

  // Productos más vendidos en un período (por defecto últimos 30 días)
  async getTopProducts(limit: number = 10, days: number = 30, siteId?: string) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startISO = startDate.toISOString();

    let ordersQuery = supabase
      .from('orders')
      .select('id')
      .eq('status', 'ENTREGADO')
      .gte('created_at', startISO);

    if (siteId) {
      ordersQuery = ordersQuery.eq('site_id', siteId);
    }

    const { data: orders, error: ordersError } = await ordersQuery;
    if (ordersError) throw new Error(`Error al obtener órdenes: ${ordersError.message}`);
    const orderIds = orders.map(o => o.id);
    if (orderIds.length === 0) return [];

    let itemsQuery = supabase
      .from('order_items')
      .select(`
        product_id,
        quantity,
        products(name, sku)
      `)
      .in('order_id', orderIds);

    const { data: items, error: itemsError } = await itemsQuery;
    if (itemsError) throw new Error(`Error al obtener items: ${itemsError.message}`);

    const productMap = new Map();
    items.forEach(item => {
      const product = item.products;
      const p = Array.isArray(product) ? product[0] : product;
      if (!p) return;
      const pid = item.product_id;
      if (!productMap.has(pid)) {
        productMap.set(pid, {
          product_id: pid,
          name: p.name,
          sku: p.sku,
          totalQuantity: 0,
        });
      }
      productMap.get(pid).totalQuantity += item.quantity;
    });

    return Array.from(productMap.values())
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, limit);
  }

  // Exportar reporte de ventas (CSV o Excel)
  async exportSalesReport(siteId?: string, start?: string, end?: string, format: 'csv' | 'excel' = 'csv') {
    const salesData = await this.getSalesByPeriod(siteId, start, end);
    
    // Generar CSV simple
    if (format === 'csv') {
      const headers = 'Fecha,Total,Orden\n';
      const rows = salesData.data.map((order: any) => 
        `${order.created_at},${order.total},${order.id}`
      ).join('\n');
      return headers + rows;
    }

    // Para Excel (simplificado, devolvemos JSON)
    return salesData.data;
  }
}