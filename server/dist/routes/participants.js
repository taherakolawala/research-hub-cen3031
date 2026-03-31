import { Router } from 'express';
import pool from '../db/pool.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';
const router = Router();
function rowToProfile(row) {
    const avail = row.availability || {};
    const demo = row.demographics || {};
    const prefs = row.participation_preferences || {};
    return {
        id: row.id,
        availableDays: avail.days || [],
        availableTimes: avail.times || [],
        hoursPerWeek: avail.hours_per_week ?? null,
        ageRange: demo.age_range ?? null,
        gender: demo.gender ?? null,
        ethnicity: demo.ethnicity ?? null,
        studyTypes: prefs.study_types || [],
        compensationPref: prefs.compensation || [],
        locationPref: prefs.location ?? null,
        notes: prefs.notes ?? null,
    };
}
// GET /api/participants/profile
router.get('/profile', authMiddleware, requireRole('student'), asyncHandler(async (req, res) => {
    const result = await pool.query('SELECT * FROM study_participant_profiles WHERE user_id = $1', [req.userId]);
    const row = result.rows[0];
    if (!row) {
        return res.json(null);
    }
    return res.json(rowToProfile(row));
}));
// PUT /api/participants/profile
router.put('/profile', authMiddleware, requireRole('student'), asyncHandler(async (req, res) => {
    const { availableDays, availableTimes, hoursPerWeek, ageRange, gender, ethnicity, studyTypes, compensationPref, locationPref, notes, } = req.body;
    const availability = {
        days: availableDays ?? [],
        times: availableTimes ?? [],
        hours_per_week: hoursPerWeek ?? null,
    };
    const demographics = {
        age_range: ageRange ?? null,
        gender: gender ?? null,
        ethnicity: ethnicity ?? null,
    };
    const participation_preferences = {
        study_types: studyTypes ?? [],
        compensation: compensationPref ?? [],
        location: locationPref ?? null,
        notes: notes ?? null,
    };
    const result = await pool.query(`INSERT INTO study_participant_profiles
       (user_id, availability, demographics, participation_preferences)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id) DO UPDATE SET
       availability              = EXCLUDED.availability,
       demographics              = EXCLUDED.demographics,
       participation_preferences = EXCLUDED.participation_preferences,
       updated_at                = NOW()
     RETURNING *`, [
        req.userId,
        JSON.stringify(availability),
        JSON.stringify(demographics),
        JSON.stringify(participation_preferences),
    ]);
    return res.json(rowToProfile(result.rows[0]));
}));
export default router;
