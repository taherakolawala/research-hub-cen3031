import { Router } from 'express';
import pool from '../db/pool.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
const router = Router();
// GET /api/pis/profile - own profile
router.get('/profile', authMiddleware, requireRole('pi'), async (req, res) => {
    const result = await pool.query(`SELECT pp.*, u.first_name, u.last_name, u.email
     FROM pi_profiles pp
     JOIN users u ON u.id = pp.user_id
     WHERE pp.user_id = $1`, [req.userId]);
    const row = result.rows[0];
    if (!row) {
        return res.status(404).json({ error: 'Profile not found' });
    }
    res.json({
        id: row.id,
        userId: row.user_id,
        department: row.department,
        labName: row.lab_name,
        researchArea: row.research_area,
        labWebsite: row.lab_website,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
    });
});
// PUT /api/pis/profile - update own profile
router.put('/profile', authMiddleware, requireRole('pi'), async (req, res) => {
    const { department, labName, researchArea, labWebsite } = req.body;
    const result = await pool.query(`UPDATE pi_profiles SET
       department = COALESCE($1, department),
       lab_name = COALESCE($2, lab_name),
       research_area = COALESCE($3, research_area),
       lab_website = COALESCE($4, lab_website),
       updated_at = NOW()
     WHERE user_id = $5
     RETURNING *`, [department ?? null, labName ?? null, researchArea ?? null, labWebsite ?? null, req.userId]);
    const row = result.rows[0];
    if (!row) {
        return res.status(404).json({ error: 'Profile not found' });
    }
    res.json({
        id: row.id,
        userId: row.user_id,
        department: row.department,
        labName: row.lab_name,
        researchArea: row.research_area,
        labWebsite: row.lab_website,
    });
});
export default router;
