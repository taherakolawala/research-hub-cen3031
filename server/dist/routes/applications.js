import { Router } from 'express';
import pool from '../db/pool.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
const router = Router();
// POST /api/applications - apply (student only)
router.post('/', authMiddleware, requireRole('student'), async (req, res) => {
    const { positionId, coverLetter } = req.body;
    if (!positionId) {
        return res.status(400).json({ error: 'positionId is required' });
    }
    const studentResult = await pool.query('SELECT id FROM student_profiles WHERE user_id = $1', [req.userId]);
    const student = studentResult.rows[0];
    if (!student) {
        return res.status(404).json({ error: 'Student profile not found' });
    }
    try {
        const result = await pool.query(`INSERT INTO applications (position_id, student_id, cover_letter)
       VALUES ($1, $2, $3)
       RETURNING *`, [positionId, student.id, coverLetter ?? null]);
        const row = result.rows[0];
        res.status(201).json({
            id: row.id,
            positionId: row.position_id,
            studentId: row.student_id,
            status: row.status,
            coverLetter: row.cover_letter,
            appliedAt: row.applied_at,
        });
    }
    catch (err) {
        const e = err;
        if (e.code === '23505') {
            return res.status(409).json({ error: 'Already applied to this position' });
        }
        throw err;
    }
});
// GET /api/applications/mine - student's apps
router.get('/mine', authMiddleware, requireRole('student'), async (req, res) => {
    const studentResult = await pool.query('SELECT id FROM student_profiles WHERE user_id = $1', [req.userId]);
    const student = studentResult.rows[0];
    if (!student) {
        return res.json([]);
    }
    const result = await pool.query(`SELECT a.*, p.title as position_title, pp.lab_name
     FROM applications a
     JOIN positions p ON p.id = a.position_id
     JOIN pi_profiles pp ON pp.id = p.pi_id
     WHERE a.student_id = $1
     ORDER BY a.applied_at DESC`, [student.id]);
    res.json(result.rows.map((row) => ({
        id: row.id,
        positionId: row.position_id,
        studentId: row.student_id,
        status: row.status,
        coverLetter: row.cover_letter,
        appliedAt: row.applied_at,
        positionTitle: row.position_title,
        labName: row.lab_name,
    })));
});
// GET /api/applications/position/:id - apps for position (owner PI only)
router.get('/position/:id', authMiddleware, requireRole('pi'), async (req, res) => {
    const { id: positionId } = req.params;
    const piResult = await pool.query('SELECT id FROM pi_profiles WHERE user_id = $1', [req.userId]);
    const pi = piResult.rows[0];
    if (!pi) {
        return res.status(404).json({ error: 'PI profile not found' });
    }
    const result = await pool.query(`SELECT a.*, sp.major, sp.gpa, sp.skills, sp.bio, sp.resume_url, sp.year_level,
            u.first_name, u.last_name, u.email
     FROM applications a
     JOIN positions p ON p.id = a.position_id
     JOIN student_profiles sp ON sp.id = a.student_id
     JOIN users u ON u.id = sp.user_id
     WHERE a.position_id = $1 AND p.pi_id = $2
     ORDER BY a.applied_at DESC`, [positionId, pi.id]);
    res.json(result.rows.map((row) => ({
        id: row.id,
        positionId: row.position_id,
        studentId: row.student_id,
        status: row.status,
        coverLetter: row.cover_letter,
        appliedAt: row.applied_at,
        major: row.major,
        gpa: row.gpa ? parseFloat(row.gpa) : null,
        skills: row.skills || [],
        bio: row.bio,
        resumeUrl: row.resume_url,
        yearLevel: row.year_level,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
    })));
});
// PATCH /api/applications/:id/status - update status (PI only)
router.patch('/:id/status', authMiddleware, requireRole('pi'), async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!status || !['pending', 'reviewed', 'accepted', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Valid status required: pending, reviewed, accepted, rejected' });
    }
    const piResult = await pool.query('SELECT id FROM pi_profiles WHERE user_id = $1', [req.userId]);
    const pi = piResult.rows[0];
    if (!pi) {
        return res.status(404).json({ error: 'PI profile not found' });
    }
    const result = await pool.query(`UPDATE applications a
     SET status = $1
     FROM positions p
     WHERE a.position_id = p.id AND p.pi_id = $2 AND a.id = $3
     RETURNING a.*`, [status, pi.id, id]);
    const row = result.rows[0];
    if (!row) {
        return res.status(404).json({ error: 'Application not found or access denied' });
    }
    res.json({
        id: row.id,
        positionId: row.position_id,
        studentId: row.student_id,
        status: row.status,
        coverLetter: row.cover_letter,
        appliedAt: row.applied_at,
    });
});
export default router;
