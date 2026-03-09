import { Router, Request, Response } from 'express';
import pool from '../db/pool.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

// GET /api/participants/profile
router.get('/profile', authMiddleware, requireRole('student'), async (req: Request, res: Response) => {
  const result = await pool.query(
    'SELECT * FROM participant_profiles WHERE user_id = $1',
    [req.userId]
  );
  const row = result.rows[0];
  if (!row) {
    return res.json(null);
  }
  res.json({
    id: row.id,
    availableDays: row.available_days || [],
    availableTimes: row.available_times || [],
    hoursPerWeek: row.hours_per_week,
    ageRange: row.age_range,
    gender: row.gender,
    ethnicity: row.ethnicity,
    studyTypes: row.study_types || [],
    compensationPref: row.compensation_pref || [],
    locationPref: row.location_pref,
    notes: row.notes,
  });
});

// PUT /api/participants/profile
router.put('/profile', authMiddleware, requireRole('student'), async (req: Request, res: Response) => {
  const {
    availableDays, availableTimes, hoursPerWeek,
    ageRange, gender, ethnicity,
    studyTypes, compensationPref, locationPref, notes,
  } = req.body;

  const result = await pool.query(
    `INSERT INTO participant_profiles
       (user_id, available_days, available_times, hours_per_week,
        age_range, gender, ethnicity,
        study_types, compensation_pref, location_pref, notes, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())
     ON CONFLICT (user_id) DO UPDATE SET
       available_days   = EXCLUDED.available_days,
       available_times  = EXCLUDED.available_times,
       hours_per_week   = EXCLUDED.hours_per_week,
       age_range        = EXCLUDED.age_range,
       gender           = EXCLUDED.gender,
       ethnicity        = EXCLUDED.ethnicity,
       study_types      = EXCLUDED.study_types,
       compensation_pref = EXCLUDED.compensation_pref,
       location_pref    = EXCLUDED.location_pref,
       notes            = EXCLUDED.notes,
       updated_at       = NOW()
     RETURNING *`,
    [
      req.userId,
      availableDays ?? [],
      availableTimes ?? [],
      hoursPerWeek ?? null,
      ageRange ?? null,
      gender ?? null,
      ethnicity ?? null,
      studyTypes ?? [],
      compensationPref ?? [],
      locationPref ?? null,
      notes ?? null,
    ]
  );
  const row = result.rows[0];
  res.json({
    id: row.id,
    availableDays: row.available_days || [],
    availableTimes: row.available_times || [],
    hoursPerWeek: row.hours_per_week,
    ageRange: row.age_range,
    gender: row.gender,
    ethnicity: row.ethnicity,
    studyTypes: row.study_types || [],
    compensationPref: row.compensation_pref || [],
    locationPref: row.location_pref,
    notes: row.notes,
  });
});

export default router;
