import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { ApiResponse } from '@research-hub/shared';
import { AppError } from '../middleware/errorHandler';
import {
  Application,
  ApplicationWithPosition,
  WITHDRAWABLE_STATUSES,
} from '../types/application';

// ---------------------------------------------------------------------------
// POST /api/applications
// ---------------------------------------------------------------------------

export async function submitApplication(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { student_id, position_id, personal_statement } = req.body;

    // Verify student_id references an existing student_profile
    const { data: student, error: studentError } = await supabaseAdmin
      .from('student_profiles')
      .select('id')
      .eq('id', student_id)
      .maybeSingle();

    if (studentError) {
      const err: AppError = new Error('Database error while verifying student profile');
      err.statusCode = 500;
      return next(err);
    }

    if (!student) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Student profile not found for the provided student_id',
      };
      res.status(404).json(response);
      return;
    }

    // Verify position_id references an existing research_position
    const { data: position, error: positionError } = await supabaseAdmin
      .from('research_positions')
      .select('id, status')
      .eq('id', position_id)
      .maybeSingle();

    if (positionError) {
      const err: AppError = new Error('Database error while verifying research position');
      err.statusCode = 500;
      return next(err);
    }

    if (!position) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Research position not found for the provided position_id',
      };
      res.status(404).json(response);
      return;
    }

    // Prevent applying to a closed or filled position
    if ((position as { status: string }).status !== 'open') {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Applications are only accepted for open positions',
      };
      res.status(409).json(response);
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('applications')
      .insert({
        student_id,
        position_id,
        personal_statement: personal_statement?.trim() ?? null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      // Unique constraint violation — student already applied to this position
      if (error.code === '23505') {
        const response: ApiResponse<never> = {
          success: false,
          error: 'You have already applied to this position',
        };
        res.status(409).json(response);
        return;
      }
      const err: AppError = new Error(error.message);
      err.statusCode = 500;
      return next(err);
    }

    const response: ApiResponse<Application> = { success: true, data };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}
