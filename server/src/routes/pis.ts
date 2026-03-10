import { Router, Request, Response } from 'express';
import pool from '../db/pool.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';

const router = Router();

// GET /api/pis/profile - own profile
router.get('/profile', authMiddleware, requireRole('pi'), asyncHandler(async (req: Request, res: Response) => {
  const result = await pool.query(
    `SELECT pp.*, u.first_name, u.last_name, u.email
     FROM pi_profiles pp
     JOIN users u ON u.id = pp.user_id
     WHERE pp.user_id = $1`,
    [req.userId]
  );
  const row = result.rows[0];
  if (!row) {
    return res.status(404).json({ error: 'Profile not found' });
  }
  return res.json({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    department: row.department,
    labName: row.lab_name,
    researchArea: (row.research_areas || []).join(', ') || null,
    researchAreas: row.research_areas || [],
    labWebsite: row.lab_website,
    staffingNeeds: row.staffing_needs,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
  });
}));

// PUT /api/pis/profile - update own profile
router.put('/profile', authMiddleware, requireRole('pi'), asyncHandler(async (req: Request, res: Response) => {
  const { name, department, labName, researchArea, researchAreas, labWebsite, staffingNeeds } = req.body;

  // Accept either researchAreas (array) or researchArea (string)
  let areas: string[] | null = null;
  if (researchAreas !== undefined) {
    areas = Array.isArray(researchAreas) ? researchAreas : [researchAreas];
  } else if (researchArea !== undefined) {
    areas = researchArea
      ? researchArea.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];
  }

  const result = await pool.query(
    `UPDATE pi_profiles SET
       name            = COALESCE($1, name),
       department      = COALESCE($2, department),
       lab_name        = COALESCE($3, lab_name),
       research_areas  = COALESCE($4, research_areas),
       lab_website     = COALESCE($5, lab_website),
       staffing_needs  = COALESCE($6, staffing_needs),
       updated_at      = NOW()
     WHERE user_id = $7
     RETURNING *`,
    [
      name ?? null,
      department ?? null,
      labName ?? null,
      areas,
      labWebsite ?? null,
      staffingNeeds ?? null,
      req.userId,
    ]
  );
  const row = result.rows[0];
  if (!row) {
    return res.status(404).json({ error: 'Profile not found' });
  }
  return res.json({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    department: row.department,
    labName: row.lab_name,
    researchArea: (row.research_areas || []).join(', ') || null,
    researchAreas: row.research_areas || [],
    labWebsite: row.lab_website,
    staffingNeeds: row.staffing_needs,
  });
}));

export default router;
