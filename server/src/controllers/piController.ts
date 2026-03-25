import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { ApiResponse } from '@research-hub/shared';
import { AppError } from '../middleware/errorHandler';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PiProfile {
  id: string;
  user_id: string;
  name: string;
  department: string;
  research_areas: string[];
  lab_name: string | null;
  staffing_needs: string | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// POST /api/pi/profile
// ---------------------------------------------------------------------------

export async function createPiProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { user_id, name, department, research_areas, lab_name, staffing_needs } = req.body;

    // Check that user_id is not already associated with a pi_profile
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('pi_profiles')
      .select('id')
      .eq('user_id', user_id)
      .maybeSingle();

    if (checkError) {
      const err: AppError = new Error('Database error while checking existing profile');
      err.statusCode = 500;
      return next(err);
    }

    if (existing) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'A PI profile already exists for this user',
      };
      res.status(409).json(response);
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('pi_profiles')
      .insert({
        user_id,
        name: name.trim(),
        department: department.trim(),
        research_areas: research_areas ?? [],
        lab_name: lab_name?.trim() ?? null,
        staffing_needs: staffing_needs?.trim() ?? null,
      })
      .select()
      .single();

    if (error) {
      const err: AppError = new Error(error.message);
      err.statusCode = 500;
      return next(err);
    }

    const response: ApiResponse<PiProfile> = { success: true, data };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// GET /api/pi/profile/:id
// ---------------------------------------------------------------------------

export async function getPiProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('pi_profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      const err: AppError = new Error(error.message);
      err.statusCode = 500;
      return next(err);
    }

    if (!data) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'PI profile not found',
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<PiProfile> = { success: true, data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}

// ---------------------------------------------------------------------------
// PUT /api/pi/profile/:id
// ---------------------------------------------------------------------------

export async function updatePiProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    // Confirm the profile exists before attempting update
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('pi_profiles')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (fetchError) {
      const err: AppError = new Error(fetchError.message);
      err.statusCode = 500;
      return next(err);
    }

    if (!existing) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'PI profile not found',
      };
      res.status(404).json(response);
      return;
    }

    // Build patch object from only the fields present in the request body
    const allowed = ['name', 'department', 'research_areas', 'lab_name', 'staffing_needs'] as const;
    type AllowedField = (typeof allowed)[number];

    const patch: Partial<Record<AllowedField, unknown>> = {};
    for (const field of allowed) {
      if (req.body[field] !== undefined) {
        patch[field] =
          typeof req.body[field] === 'string' ? req.body[field].trim() : req.body[field];
      }
    }

    if (Object.keys(patch).length === 0) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Request body must include at least one field to update',
      };
      res.status(400).json(response);
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('pi_profiles')
      .update(patch)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      const err: AppError = new Error(error.message);
      err.statusCode = 500;
      return next(err);
    }

    const response: ApiResponse<PiProfile> = { success: true, data };
    res.json(response);
  } catch (err) {
    next(err);
  }
}
