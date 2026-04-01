import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { STUDY_STATUSES, UPDATE_ALLOWED_FIELDS, } from '../types/studyListing';
// ---------------------------------------------------------------------------
// PUT /api/studies/:id
// ---------------------------------------------------------------------------
export async function updateStudy(req, res, next) {
    try {
        const { id } = req.params;
        // Confirm study exists before attempting update
        const { data: existing, error: fetchError } = await supabaseAdmin
            .from('study_listings')
            .select('id, status')
            .eq('id', id)
            .maybeSingle();
        if (fetchError) {
            const err = new AppError(fetchError.message);
            err.statusCode = 500;
            return next(err);
        }
        if (!existing) {
            const response = {
                success: false,
                error: 'Study listing not found',
            };
            res.status(404).json(response);
            return;
        }
        // Build patch from allowed fields only
        const patch = {};
        for (const field of UPDATE_ALLOWED_FIELDS) {
            if (req.body[field] !== undefined) {
                const val = req.body[field];
                patch[field] = typeof val === 'string' ? val.trim() : val;
            }
        }
        if (Object.keys(patch).length === 0) {
            const response = {
                success: false,
                error: 'Request body must include at least one field to update',
            };
            res.status(400).json(response);
            return;
        }
        // Reject re-opening a closed/completed study via PUT
        if (existing.status !== 'recruiting' &&
            patch.status === 'recruiting') {
            const response = {
                success: false,
                error: 'A closed or completed study cannot be re-opened',
            };
            res.status(409).json(response);
            return;
        }
        const { data, error } = await supabaseAdmin
            .from('study_listings')
            .update(patch)
            .eq('id', id)
            .select()
            .single();
        if (error) {
            const err = new AppError(error.message);
            err.statusCode = 500;
            return next(err);
        }
        const response = { success: true, data };
        res.json(response);
    }
    catch (err) {
        next(err);
    }
}
// ---------------------------------------------------------------------------
// DELETE /api/studies/:id
// ---------------------------------------------------------------------------
export async function closeStudy(req, res, next) {
    try {
        const { id } = req.params;
        // Confirm study exists
        const { data: existing, error: fetchError } = await supabaseAdmin
            .from('study_listings')
            .select('id, status')
            .eq('id', id)
            .maybeSingle();
        if (fetchError) {
            const err = new AppError(fetchError.message);
            err.statusCode = 500;
            return next(err);
        }
        if (!existing) {
            const response = {
                success: false,
                error: 'Study listing not found',
            };
            res.status(404).json(response);
            return;
        }
        if (existing.status === 'closed') {
            const response = {
                success: false,
                error: 'Study listing is already closed',
            };
            res.status(409).json(response);
            return;
        }
        const { data, error } = await supabaseAdmin
            .from('study_listings')
            .update({ status: 'closed' })
            .eq('id', id)
            .select()
            .single();
        if (error) {
            const err = new AppError(error.message);
            err.statusCode = 500;
            return next(err);
        }
        const response = {
            success: true,
            data,
            message: 'Study listing closed successfully',
        };
        res.json(response);
    }
    catch (err) {
        next(err);
    }
}
// ---------------------------------------------------------------------------
// GET /api/studies
// ---------------------------------------------------------------------------
export async function listStudies(req, res, next) {
    try {
        const { pi_id, status } = req.query;
        // Validate status query param if provided
        const statusFilter = status ?? 'recruiting';
        if (!STUDY_STATUSES.includes(statusFilter)) {
            const response = {
                success: false,
                error: `status must be one of: ${STUDY_STATUSES.join(', ')}`,
            };
            res.status(400).json(response);
            return;
        }
        let query = supabaseAdmin
            .from('study_listings')
            .select('*')
            .eq('status', statusFilter)
            .order('created_at', { ascending: false });
        if (pi_id && typeof pi_id === 'string') {
            query = query.eq('pi_id', pi_id);
        }
        const { data, error } = await query;
        if (error) {
            const err = new AppError(error.message);
            err.statusCode = 500;
            return next(err);
        }
        const response = { success: true, data: data ?? [] };
        res.json(response);
    }
    catch (err) {
        next(err);
    }
}
// ---------------------------------------------------------------------------
// GET /api/studies/:id
// ---------------------------------------------------------------------------
export async function getStudyById(req, res, next) {
    try {
        const { id } = req.params;
        const { data, error } = await supabaseAdmin
            .from('study_listings')
            .select('*')
            .eq('id', id)
            .maybeSingle();
        if (error) {
            const err = new AppError(error.message);
            err.statusCode = 500;
            return next(err);
        }
        if (!data) {
            const response = {
                success: false,
                error: 'Study listing not found',
            };
            res.status(404).json(response);
            return;
        }
        const response = { success: true, data };
        res.json(response);
    }
    catch (err) {
        next(err);
    }
}
// ---------------------------------------------------------------------------
// POST /api/studies
// ---------------------------------------------------------------------------
export async function createStudy(req, res, next) {
    try {
        const { pi_id, title, eligibility_criteria, compensation_details, scheduling_options } = req.body;
        // Verify the pi_id references an existing pi_profile
        const { data: pi, error: piError } = await supabaseAdmin
            .from('pi_profiles')
            .select('id')
            .eq('id', pi_id)
            .maybeSingle();
        if (piError) {
            const err = new AppError('Database error while verifying PI profile');
            err.statusCode = 500;
            return next(err);
        }
        if (!pi) {
            const response = {
                success: false,
                error: 'PI profile not found for the provided pi_id',
            };
            res.status(404).json(response);
            return;
        }
        const { data, error } = await supabaseAdmin
            .from('study_listings')
            .insert({
            pi_id,
            title: title.trim(),
            eligibility_criteria: eligibility_criteria?.trim() ?? null,
            compensation_details: compensation_details?.trim() ?? null,
            scheduling_options: scheduling_options ?? {},
            status: 'recruiting',
        })
            .select()
            .single();
        if (error) {
            const err = new AppError(error.message);
            err.statusCode = 500;
            return next(err);
        }
        const response = { success: true, data };
        res.status(201).json(response);
    }
    catch (err) {
        next(err);
    }
}
