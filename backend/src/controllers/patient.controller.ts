import { Request, Response } from 'express';
import { z } from 'zod';
import { logger } from '../config/logger';
import {
  listPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
} from '../services/patient.service';

const CreatePatientSchema = z.object({
  name: z.string().min(1),
  dob: z.string().optional(),
  assignedDoctorId: z.string().min(1),
  tags: z.array(z.string()).optional().default([]),
});

const UpdatePatientSchema = z.object({
  name: z.string().min(1).optional(),
  dob: z.string().optional(),
  assignedDoctorId: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
});

const ListQuerySchema = z.object({
  q: z.string().optional(),
  tags: z.string().optional(), // comma-separated
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export async function list(req: Request, res: Response): Promise<void> {
  const parsed = ListQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() });
    return;
  }

  const { q, tags, from, to, page, limit } = parsed.data;
  const user = req.user!;

  try {
    const result = await listPatients({
      q,
      tags: tags ? tags.split(',').map((t) => t.trim()) : undefined,
      from,
      to,
      page,
      limit,
      requestingUserId: user.userId,
      requestingUserRole: user.role,
    });
    res.json(result);
  } catch (err) {
    logger.error('List patients failed', {
      message: (err as Error).message,
      stack: (err as Error).stack,
    });
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getOne(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const user = req.user!;

  try {
    const patient = await getPatientById(id, user.userId, user.role);
    if (!patient) {
      res.status(404).json({ message: 'Patient not found' });
      return;
    }
    res.json(patient);
  } catch (err) {
    logger.error('Get patient failed', {
      message: (err as Error).message,
      stack: (err as Error).stack,
    });
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  const parsed = CreatePatientSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() });
    return;
  }

  try {
    const patient = await createPatient(parsed.data);
    logger.info('Patient created', { patientId: patient.id });
    res.status(201).json(patient);
  } catch (err) {
    logger.error('Create patient failed', {
      message: (err as Error).message,
      stack: (err as Error).stack,
    });
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  const parsed = UpdatePatientSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Validation error', errors: parsed.error.flatten() });
    return;
  }

  try {
    const patient = await updatePatient(id, parsed.data);
    logger.info('Patient updated', { patientId: id });
    res.json(patient);
  } catch (err) {
    const error = err as Error & { code?: string };
    if (error.code === 'P2025') {
      res.status(404).json({ message: 'Patient not found' });
      return;
    }
    logger.error('Update patient failed', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  const { id } = req.params;

  try {
    await deletePatient(id);
    logger.info('Patient deleted', { patientId: id });
    res.status(204).send();
  } catch (err) {
    const error = err as Error & { code?: string };
    if (error.code === 'P2025') {
      res.status(404).json({ message: 'Patient not found' });
      return;
    }
    logger.error('Delete patient failed', {
      message: error.message,
      stack: error.stack,
    });
    res.status(500).json({ message: 'Internal server error' });
  }
}
