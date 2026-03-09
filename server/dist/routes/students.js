import { Router } from 'express';
import pool from '../db/pool.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
const router = Router();
// GET /api/students/profile - own profile (student only)
router.get('/profile', authMiddleware, requireRole('student'), async (req, res) => {
    const result = await pool.query(`SELECT sp.*, u.first_name, u.last_name, u.email
     FROM student_profiles sp
     JOIN users u ON u.id = sp.user_id
     WHERE sp.user_id = $1`, [req.userId]);
    const row = result.rows[0];
    if (!row) {
        return res.status(404).json({ error: 'Profile not found' });
    }
    res.json({
        id: row.id,
        userId: row.user_id,
        major: row.major,
        gpa: row.gpa ? parseFloat(row.gpa) : null,
        graduationYear: row.graduation_year,
        skills: row.skills || [],
        bio: row.bio,
        resumeUrl: row.resume_url,
        yearLevel: row.year_level,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
    });
});
// PUT /api/students/profile - update own profile
router.put('/profile', authMiddleware, requireRole('student'), async (req, res) => {
    const { major, gpa, graduationYear, skills, bio, resumeUrl, yearLevel } = req.body;
    const result = await pool.query(`UPDATE student_profiles SET
       major = COALESCE($1, major),
       gpa = COALESCE($2, gpa),
       graduation_year = COALESCE($3, graduation_year),
       skills = COALESCE($4, skills),
       bio = COALESCE($5, bio),
       resume_url = COALESCE($6, resume_url),
       year_level = COALESCE($7, year_level),
       updated_at = NOW()
     WHERE user_id = $8
     RETURNING *`, [major ?? null, gpa ?? null, graduationYear ?? null, skills ?? [], bio ?? null, resumeUrl ?? null, yearLevel ?? null, req.userId]);
    const row = result.rows[0];
    if (!row) {
        return res.status(404).json({ error: 'Profile not found' });
    }
    res.json({
        id: row.id,
        userId: row.user_id,
        major: row.major,
        gpa: row.gpa ? parseFloat(row.gpa) : null,
        graduationYear: row.graduation_year,
        skills: row.skills || [],
        bio: row.bio,
        resumeUrl: row.resume_url,
        yearLevel: row.year_level,
    });
});
// GET /api/students - list with filters (PI only)
router.get('/', authMiddleware, requireRole('pi'), async (req, res) => {
    const { major, minGpa, skills, yearLevel } = req.query;
    let query = `
    SELECT sp.*, u.first_name, u.last_name, u.email
    FROM student_profiles sp
    JOIN users u ON u.id = sp.user_id
    WHERE 1=1
  `;
    const params = [];
    let paramIndex = 1;
    if (major && typeof major === 'string') {
        query += ` AND sp.major ILIKE $${paramIndex}`;
        params.push(`%${major}%`);
        paramIndex++;
    }
    if (minGpa !== undefined && minGpa !== '') {
        query += ` AND sp.gpa >= $${paramIndex}`;
        params.push(parseFloat(minGpa));
        paramIndex++;
    }
    if (skills && typeof skills === 'string') {
        const skillArr = skills.split(',').map((s) => s.trim()).filter(Boolean);
        if (skillArr.length > 0) {
            query += ` AND sp.skills && $${paramIndex}::text[]`;
            params.push(skillArr);
            paramIndex++;
        }
    }
    if (yearLevel && typeof yearLevel === 'string') {
        query += ` AND sp.year_level = $${paramIndex}`;
        params.push(yearLevel);
        paramIndex++;
    }
    query += ' ORDER BY sp.updated_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        major: row.major,
        gpa: row.gpa ? parseFloat(row.gpa) : null,
        graduationYear: row.graduation_year,
        skills: row.skills || [],
        bio: row.bio,
        resumeUrl: row.resume_url,
        yearLevel: row.year_level,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
    })));
});
// GET /api/students/:id - single student (PI only)
router.get('/:id', authMiddleware, requireRole('pi'), async (req, res) => {
    const { id } = req.params;
    const result = await pool.query(`SELECT sp.*, u.first_name, u.last_name, u.email
     FROM student_profiles sp
     JOIN users u ON u.id = sp.user_id
     WHERE sp.id = $1`, [id]);
    const row = result.rows[0];
    if (!row) {
        return res.status(404).json({ error: 'Student not found' });
    }
    res.json({
        id: row.id,
        userId: row.user_id,
        major: row.major,
        gpa: row.gpa ? parseFloat(row.gpa) : null,
        graduationYear: row.graduation_year,
        skills: row.skills || [],
        bio: row.bio,
        resumeUrl: row.resume_url,
        yearLevel: row.year_level,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
    });
});
export default router;
