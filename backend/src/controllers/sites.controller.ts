import { FastifyRequest, FastifyReply } from 'fastify';
import { SitesService } from '../services/sites.service';
import {
  CreateSiteSchema,
  UpdateSiteSchema,
  ListSitesQuerySchema,
  CreateBranchSchema,
  UpdateBranchSchema,
  ListBranchesQuerySchema,
} from '../schemas/sites.schema';
import { z } from 'zod';

const sitesService = new SitesService();

function getAuthUser(request: FastifyRequest) {
  return (request as any).user;
}

// ── SITES ──────────────────────────────────────────────────────────

export async function listSitesHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({ success: false, error: 'No tienes permisos para listar sites' });
    }

    const query = ListSitesQuerySchema.parse(request.query);
    const result = await sitesService.listSites(query);
    return reply.send({ success: true, ...result });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({ success: false, error: 'Datos de consulta inválidos', details: err.issues });
    }
    console.error('Error en listSitesHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al listar sites' });
  }
}

export async function getSiteHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    const siteId = request.params.id;

    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({ success: false, error: 'No tienes permisos para ver este site' });
    }

    // Si es site_admin, solo puede ver su propio site
    if (authUser.roles.includes('site_admin') && !authUser.roles.includes('super_admin')) {
      if (authUser.site_id !== siteId) {
        return reply.status(403).send({ success: false, error: 'No puedes ver este site' });
      }
    }

    const site = await sitesService.getSiteById(siteId);
    return reply.send({ success: true, data: site });
  } catch (err: any) {
    console.error('Error en getSiteHandler:', err);
    return reply.status(404).send({ success: false, error: err.message || 'Site no encontrado' });
  }
}

export async function createSiteHandler(
  request: FastifyRequest<{ Body: any }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || !authUser.roles.includes('super_admin')) {
      return reply.status(403).send({ success: false, error: 'Solo Super Administradores pueden crear sites' });
    }

    const data = CreateSiteSchema.parse(request.body);
    const site = await sitesService.createSite(data);
    return reply.status(201).send({ success: true, data: site });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({ success: false, error: 'Datos inválidos', details: err.issues });
    }
    console.error('Error en createSiteHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al crear site' });
  }
}

export async function updateSiteHandler(
  request: FastifyRequest<{ Params: { id: string }; Body: any }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    const siteId = request.params.id;

    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({ success: false, error: 'No tienes permisos para actualizar este site' });
    }

    // Si es site_admin, solo puede actualizar su propio site
    if (authUser.roles.includes('site_admin') && !authUser.roles.includes('super_admin')) {
      if (authUser.site_id !== siteId) {
        return reply.status(403).send({ success: false, error: 'No puedes actualizar este site' });
      }
    }

    const data = UpdateSiteSchema.parse(request.body);
    const site = await sitesService.updateSite(siteId, data);
    return reply.send({ success: true, data: site });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({ success: false, error: 'Datos inválidos', details: err.issues });
    }
    console.error('Error en updateSiteHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al actualizar site' });
  }
}

export async function deleteSiteHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || !authUser.roles.includes('super_admin')) {
      return reply.status(403).send({ success: false, error: 'Solo Super Administradores pueden eliminar sites' });
    }

    const siteId = request.params.id;
    const result = await sitesService.deleteSite(siteId);
    // ✅ CORREGIDO: Ya no duplicamos success
    return reply.send(result);
  } catch (err: any) {
    console.error('Error en deleteSiteHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al eliminar site' });
  }
}

// ── BRANCHES ──────────────────────────────────────────────────────

export async function listBranchesHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin') && !authUser.roles.includes('branch_manager'))) {
      return reply.status(403).send({ success: false, error: 'No tienes permisos para listar branches' });
    }

    const query = ListBranchesQuerySchema.parse(request.query);

    // Si es branch_manager, solo ve branches de su branch
    if (authUser.roles.includes('branch_manager') && !authUser.roles.includes('site_admin') && !authUser.roles.includes('super_admin')) {
      query.site_id = authUser.site_id;
    }

    const result = await sitesService.listBranches(query);
    return reply.send({ success: true, ...result });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({ success: false, error: 'Datos de consulta inválidos', details: err.issues });
    }
    console.error('Error en listBranchesHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al listar branches' });
  }
}

export async function getBranchHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    const branchId = request.params.id;

    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin') && !authUser.roles.includes('branch_manager'))) {
      return reply.status(403).send({ success: false, error: 'No tienes permisos para ver esta branch' });
    }

    const branch = await sitesService.getBranchById(branchId);

    // Si es branch_manager, solo puede ver su propia branch
    if (authUser.roles.includes('branch_manager') && !authUser.roles.includes('site_admin') && !authUser.roles.includes('super_admin')) {
      if (authUser.branch_id !== branchId) {
        return reply.status(403).send({ success: false, error: 'No puedes ver esta branch' });
      }
    }

    return reply.send({ success: true, data: branch });
  } catch (err: any) {
    console.error('Error en getBranchHandler:', err);
    return reply.status(404).send({ success: false, error: err.message || 'Branch no encontrada' });
  }
}

export async function createBranchHandler(
  request: FastifyRequest<{ Body: any }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({ success: false, error: 'No tienes permisos para crear branches' });
    }

    const data = CreateBranchSchema.parse(request.body);

    // Si es site_admin, solo puede crear branches en su site
    if (authUser.roles.includes('site_admin') && !authUser.roles.includes('super_admin')) {
      if (data.site_id !== authUser.site_id) {
        return reply.status(403).send({ success: false, error: 'No puedes crear branches fuera de tu site' });
      }
    }

    const branch = await sitesService.createBranch(data);
    return reply.status(201).send({ success: true, data: branch });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({ success: false, error: 'Datos inválidos', details: err.issues });
    }
    console.error('Error en createBranchHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al crear branch' });
  }
}

export async function updateBranchHandler(
  request: FastifyRequest<{ Params: { id: string }; Body: any }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    const branchId = request.params.id;

    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin') && !authUser.roles.includes('branch_manager'))) {
      return reply.status(403).send({ success: false, error: 'No tienes permisos para actualizar esta branch' });
    }

    // Si es branch_manager, solo puede actualizar su propia branch
    if (authUser.roles.includes('branch_manager') && !authUser.roles.includes('site_admin') && !authUser.roles.includes('super_admin')) {
      if (authUser.branch_id !== branchId) {
        return reply.status(403).send({ success: false, error: 'No puedes actualizar esta branch' });
      }
    }

    const data = UpdateBranchSchema.parse(request.body);
    const branch = await sitesService.updateBranch(branchId, data);
    return reply.send({ success: true, data: branch });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return reply.status(400).send({ success: false, error: 'Datos inválidos', details: err.issues });
    }
    console.error('Error en updateBranchHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al actualizar branch' });
  }
}

export async function deleteBranchHandler(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || (!authUser.roles.includes('super_admin') && !authUser.roles.includes('site_admin'))) {
      return reply.status(403).send({ success: false, error: 'No tienes permisos para eliminar branches' });
    }

    const branchId = request.params.id;
    const result = await sitesService.deleteBranch(branchId);
    // ✅ CORREGIDO: Ya no duplicamos success
    return reply.send(result);
  } catch (err: any) {
    console.error('Error en deleteBranchHandler:', err);
    return reply.status(500).send({ success: false, error: err.message || 'Error al eliminar branch' });
  }
}