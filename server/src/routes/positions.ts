import { Router, Request, Response } from 'express';
import pool from '../db/pool.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

// POST /api/positions - create (PI only)
router.post('/', authMiddleware, requireRole('pi'), async (req: Request, res: Response) => {
  const { title, description, requiredSkills, minGpa, isFunded, deadline } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  const piResult = await pool.query('SELECT id FROM pi_profiles WHERE user_id = $1', [req.userId]);
  const pi = piResult.rows[0];
  if (!pi) {
    return res.status(404).json({ error: 'PI profile not found' });
  }
  const result = await pool.query(
    `INSERT INTO positions (pi_id, title, description, required_skills, min_gpa, is_funded, deadline)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [pi.id, title, description ?? null, requiredSkills ?? [], minGpa ?? null, isFunded ?? false, deadline ?? null]
  );
  const row = result.rows[0];
  res.status(201).json({
    id: row.id,
    piId: row.pi_id,
    title: row.title,
    description: row.description,
    requiredSkills: row.required_skills || [],
    minGpa: row.min_gpa ? parseFloat(row.min_gpa) : null,
    isFunded: row.is_funded,
    isOpen: row.is_open,
    createdAt: row.created_at,
    deadline: row.deadline,
  });
});

// GET /api/positions - list with filters (public)
router.get('/', async (req: Request, res: Response) => {
  const { search, skills, isFunded, department } = req.query;
  let query = `
    SELECT p.*, pp.department, pp.lab_name, pp.research_area
    FROM positions p
    JOIN pi_profiles pp ON pp.id = p.pi_id
    WHERE p.is_open = true
  `;
  const params: unknown[] = [];
  let paramIndex = 1;

  if (search && typeof search === 'string') {
    query += ` AND (p.title ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }
  if (skills && typeof skills === 'string') {
    const skillArr = skills.split(',').map((s) => s.trim()).filter(Boolean);
    if (skillArr.length > 0) {
      query += ` AND p.required_skills && $${paramIndex}::text[]`;
      params.push(skillArr);
      paramIndex++;
    }
  }
  if (isFunded === 'true') {
    query += ` AND p.is_funded = true`;
  }
  if (department && typeof department === 'string') {
    query += ` AND pp.department ILIKE $${paramIndex}`;
    params.push(`%${department}%`);
    paramIndex++;
  }

  query += ' ORDER BY p.created_at DESC';

  const result = await pool.query(query, params);
  res.json(
    result.rows.map((row) => ({
      id: row.id,
      piId: row.pi_id,
      title: row.title,
      description: row.description,
      requiredSkills: row.required_skills || [],
      minGpa: row.min_gpa ? parseFloat(row.min_gpa) : null,
      isFunded: row.is_funded,
      isOpen: row.is_open,
      createdAt: row.created_at,
      deadline: row.deadline,
      department: row.department,
      labName: row.lab_name,
      researchArea: row.research_area,
    }))
  );
});

// GET /api/positions/mine - PI's own positions
router.get('/mine', authMiddleware, requireRole('pi'), async (req: Request, res: Response) => {
  const piResult = await pool.query('SELECT id FROM pi_profiles WHERE user_id = $1', [req.userId]);
  const pi = piResult.rows[0];
  if (!pi) {
    return res.json([]);
  }
  const result = await pool.query(
    `SELECT p.*, 
       (SELECT COUNT(*) FROM applications a WHERE a.position_id = p.id) as app_count
     FROM positions p
     WHERE p.pi_id = $1
     ORDER BY p.created_at DESC`,
    [pi.id]
  );
  res.json(
    result.rows.map((row) => ({
      id: row.id,
      piId: row.pi_id,
      title: row.title,
      description: row.description,
      requiredSkills: row.required_skills || [],
      minGpa: row.min_gpa ? parseFloat(row.min_gpa) : null,
      isFunded: row.is_funded,
      isOpen: row.is_open,
      createdAt: row.created_at,
      deadline: row.deadline,
      appCount: parseInt(row.app_count, 10),
    }))
  );
});

// GET /api/positions/:id - detail
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await pool.query(
    `SELECT p.*, pp.department, pp.lab_name, pp.research_area, pp.lab_website
     FROM positions p
     JOIN pi_profiles pp ON pp.id = p.pi_id
     WHERE p.id = $1`,
    [id]
  );
  const row = result.rows[0];
  if (!row) {
    return res.status(404).json({ error: 'Position not found' });
  }
  res.json({
    id: row.id,
    piId: row.pi_id,
    title: row.title,
    description: row.description,
    requiredSkills: row.required_skills || [],
    minGpa: row.min_gpa ? parseFloat(row.min_gpa) : null,
    isFunded: row.is_funded,
    isOpen: row.is_open,
    createdAt: row.created_at,
    deadline: row.deadline,
    department: row.department,
    labName: row.lab_name,
    researchArea: row.research_area,
    labWebsite: row.lab_website,
  });
});

// PUT /api/positions/:id - update (owner only)
router.put('/:id', authMiddleware, requireRole('pi'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, requiredSkills, minGpa, isFunded, isOpen, deadline } = req.body;
  const piResult = await pool.query('SELECT id FROM pi_profiles WHERE user_id = $1', [req.userId]);
  const pi = piResult.rows[0];
  if (!pi) {
    return res.status(404).json({ error: 'PI profile not found' });
  }
  const result = await pool.query(
    `UPDATE positions SET
       title = COALESCE($1, title),
       description = COALESCE($2, description),
       required_skills = COALESCE($3, required_skills),
       min_gpa = COALESCE($4, min_gpa),
       is_funded = COALESCE($5, is_funded),
       is_open = COALESCE($6, is_open),
       deadline = COALESCE($7, deadline)
     WHERE id = $8 AND pi_id = $9
     RETURNING *`,
    [title ?? null, description ?? null, requiredSkills ?? null, minGpa ?? null, isFunded ?? null, isOpen ?? null, deadline ?? null, id, pi.id]
  );
  const row = result.rows[0];
  if (!row) {
    return res.status(404).json({ error: 'Position not found or access denied' });
  }
  res.json({
    id: row.id,
    piId: row.pi_id,
    title: row.title,
    description: row.description,
    requiredSkills: row.required_skills || [],
    minGpa: row.min_gpa ? parseFloat(row.min_gpa) : null,
    isFunded: row.is_funded,
    isOpen: row.is_open,
    createdAt: row.created_at,
    deadline: row.deadline,
  });
});

// DELETE /api/positions/:id - close (owner only), marks pending/reviewed applications as withdrawn
router.delete('/:id', authMiddleware, requireRole('pi'), async (req: Request, res: Response) => {
  const { id } = req.params;
  const piResult = await pool.query('SELECT id FROM pi_profiles WHERE user_id = $1', [req.userId]);
  const pi = piResult.rows[0];
  if (!pi) {
    return res.status(404).json({ error: 'PI profile not found' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `UPDATE positions SET is_open = false WHERE id = $1 AND pi_id = $2 RETURNING id`,
      [id, pi.id]
    );
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Position not found or access denied' });
    }
    await client.query(
      `UPDATE applications SET status = 'withdrawn'
       WHERE position_id = $1 AND status IN ('pending', 'reviewed')`,
      [id]
    );
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
  res.status(204).send();
});

export default router;
