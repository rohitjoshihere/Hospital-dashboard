import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface PatientFilters {
  q?: string;
  tags?: string[];
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  requestingUserId: string;
  requestingUserRole: 'ADMIN' | 'DOCTOR';
}

export interface CreatePatientInput {
  name: string;
  dob?: string;
  assignedDoctorId: string;
  tags?: string[];
}

export interface UpdatePatientInput {
  name?: string;
  dob?: string;
  assignedDoctorId?: string;
  tags?: string[];
}

/**
 * Builds a dynamic Prisma where clause.
 * DOCTOR role always appends assignedDoctorId filter — enforced at DB level.
 */
function buildWhereClause(filters: PatientFilters): Prisma.PatientWhereInput {
  const where: Prisma.PatientWhereInput = {};

  // RBAC: DOCTOR always scoped to their own patients
  if (filters.requestingUserRole === 'DOCTOR') {
    where.assignedDoctorId = filters.requestingUserId;
  }

  // Full-text name search — uses @@index([name]) for O(log n) ILIKE
  if (filters.q && filters.q.trim().length > 0) {
    where.name = { contains: filters.q.trim(), mode: 'insensitive' };
  }

  // Tag filter — patient must have at least one matching tag
  if (filters.tags && filters.tags.length > 0) {
    where.tags = {
      some: {
        tag: { name: { in: filters.tags } },
      },
    };
  }

  // Date range filter — uses @@index([createdAt])
  if (filters.from ?? filters.to) {
    where.createdAt = {
      ...(filters.from ? { gte: new Date(filters.from) } : {}),
      ...(filters.to ? { lte: new Date(filters.to) } : {}),
    };
  }

  return where;
}

export async function listPatients(filters: PatientFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 20));
  const skip = (page - 1) * limit;

  const sortBy = filters.sortBy ?? 'createdAt';
  const sortOrder = filters.sortOrder ?? 'desc';

  const where = buildWhereClause(filters);

  const [data, total] = await prisma.$transaction([
    prisma.patient.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        tags: { include: { tag: { select: { id: true, name: true } } } },
        doctor: { select: { id: true, name: true, email: true } },
        media: {
          select: {
            id: true,
            type: true,
            status: true,
            thumbPath: true,
            uploadedAt: true,
          },
          orderBy: { uploadedAt: 'desc' },
        },
      },
    }),
    prisma.patient.count({ where }),
  ]);

  return { data, page, limit, total };
}

export async function getPatientById(
  id: string,
  requestingUserId: string,
  requestingUserRole: 'ADMIN' | 'DOCTOR'
) {
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      tags: { include: { tag: { select: { id: true, name: true } } } },
      doctor: { select: { id: true, name: true, email: true } },
      media: {
        select: {
          id: true,
          type: true,
          status: true,
          thumbPath: true,
          uploadedAt: true,
          processedAt: true,
        },
      },
    },
  });

  if (!patient) return null;

  // DOCTOR can only access their own patients — enforced at DB result level
  if (requestingUserRole === 'DOCTOR' && patient.assignedDoctorId !== requestingUserId) {
    return null;
  }

  return patient;
}

export async function createPatient(input: CreatePatientInput) {
  const { name, dob, assignedDoctorId, tags = [] } = input;

  const tagRecords = await Promise.all(
    tags.map((tagName) =>
      prisma.tag.upsert({
        where: { name: tagName },
        update: {},
        create: { name: tagName },
      })
    )
  );

  return prisma.patient.create({
    data: {
      name,
      dob: dob ? new Date(dob) : undefined,
      assignedDoctorId,
      tags: {
        create: tagRecords.map((tag: { id: string }) => ({ tagId: tag.id })),
      },
    },
    include: {
      tags: { include: { tag: { select: { id: true, name: true } } } },
      doctor: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function updatePatient(id: string, input: UpdatePatientInput) {
  const { name, dob, assignedDoctorId, tags } = input;

  if (tags !== undefined) {
    const tagRecords = await Promise.all(
      tags.map((tagName) =>
        prisma.tag.upsert({
          where: { name: tagName },
          update: {},
          create: { name: tagName },
        })
      )
    );

    await prisma.patientTag.deleteMany({ where: { patientId: id } });

    return prisma.patient.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(dob !== undefined ? { dob: new Date(dob) } : {}),
        ...(assignedDoctorId !== undefined ? { assignedDoctorId } : {}),
        tags: {
          create: tagRecords.map((tag: { id: string }) => ({ tagId: tag.id })),
        },
      },
      include: {
        tags: { include: { tag: { select: { id: true, name: true } } } },
        doctor: { select: { id: true, name: true, email: true } },
      },
    });
  }

  return prisma.patient.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(dob !== undefined ? { dob: new Date(dob) } : {}),
      ...(assignedDoctorId !== undefined ? { assignedDoctorId } : {}),
    },
    include: {
      tags: { include: { tag: { select: { id: true, name: true } } } },
      doctor: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function deletePatient(id: string) {
  return prisma.patient.delete({ where: { id } });
}
