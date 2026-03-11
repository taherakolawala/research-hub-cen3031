import { Router } from 'express';
import { validateBody } from '../middleware/validate';
import { createPiProfile, getPiProfile, updatePiProfile } from '../controllers/piController';

const router = Router();

/**
 * POST /api/pi/profile
 * Create a new PI profile.
 *
 * Body:
 *   user_id        string (uuid, required)  — references users.id
 *   name           string (required)        — PI's display name
 *   department     string (required)        — home department
 *   research_areas string[] (optional)      — research domain tags
 *   lab_name       string (optional)        — name of the lab
 *   staffing_needs string (optional)        — free-text current hiring description
 */
router.post(
  '/profile',
  validateBody([
    { field: 'user_id',    required: true,  type: 'uuid',   label: 'user_id' },
    { field: 'name',       required: true,  type: 'string', minLength: 1, label: 'name' },
    { field: 'department', required: true,  type: 'string', minLength: 1, label: 'department' },
    { field: 'research_areas', type: 'array',  label: 'research_areas' },
    { field: 'lab_name',       type: 'string', label: 'lab_name' },
    { field: 'staffing_needs', type: 'string', label: 'staffing_needs' },
  ]),
  createPiProfile
);

/**
 * GET /api/pi/profile/:id
 * Retrieve a PI profile by its primary key (pi_profiles.id).
 */
router.get('/profile/:id', getPiProfile);

/**
 * PUT /api/pi/profile/:id
 * Partially update a PI profile. All fields are optional; at least one must be provided.
 *
 * Body (all optional):
 *   name           string
 *   department     string
 *   research_areas string[]
 *   lab_name       string
 *   staffing_needs string
 */
router.put(
  '/profile/:id',
  validateBody([
    { field: 'name',           type: 'string', minLength: 1, label: 'name' },
    { field: 'department',     type: 'string', minLength: 1, label: 'department' },
    { field: 'research_areas', type: 'array',  label: 'research_areas' },
    { field: 'lab_name',       type: 'string', label: 'lab_name' },
    { field: 'staffing_needs', type: 'string', label: 'staffing_needs' },
  ]),
  updatePiProfile
);

export default router;
