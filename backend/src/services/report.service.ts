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
      .eq('status', 'ENTREGADO'); // Solo órdenes entregadas (pagadas)

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
      // Necesitamos filtrar por site_id a través de la relación supplies
      query = query.eq('supplies.site_id', siteId);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Error al obtener inventario: ${error.message}`);

    // Asegurar que supplies sea un objeto (no un array)
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

    // 1. Obtener IDs de órdenes entregadas en el período
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

    // 2. Obtener items de esas órdenes
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

    // 3. Agrupar por producto
    const productMap = new Map();
    items.forEach(item => {
      const product = item.products;
      // products es un array (por la relación), tomamos el primer elemento
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

    // 4. Ordenar y limitar
    const sorted = Array.from(productMap.values())
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, limit);

    return sorted;
  }
}