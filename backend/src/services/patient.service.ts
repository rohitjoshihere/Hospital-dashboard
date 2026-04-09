import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface PatientFilters {
  q?: string;
  tags?: string[];
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
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

// Build the base where clause — DOCTOR role always scoped to their own patients
function buildWhereClause(
  filters: PatientFilters
): Prisma.PatientWhereInput {
  const where: Prisma.PatientWhereInput = {};

  if (filters.requestingUserRole === 'DOCTOR') {
    where.assignedDoctorId = filters.requestingUserId;
  }

  if (filters.q) {
    where.name = { contains: filters.q, mode: 'insensitive' };
  }

  if (filters.tags && filters.tags.length > 0) {
    where.tags = { some: { tag: { name: { in: filters.tags } } } };
  }

  if (filters.from ?? filters.to) {
    where.createdAt = {
      ...(filters.from ? { gte: new Date(filters.from) } : {}),
      ...(filters.to ? { lte: new Date(filters.to) } : {}),
    };
  }

  return where;
}

export async function listPatients(filters: PatientFilters) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const skip = (page - 1) * limit;

  const where = buildWhereClause(filters);

  const [data, total] = await prisma.$transaction([
    prisma.patient.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        tags: { include: { tag: true } },
        doctor: { select: { id: true, name: true, email: true } },
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
  const where: Prisma.PatientWhereUniqueInput = { id };

  const patient = await prisma.patient.findUnique({
    where,
    include: {
      tags: { include: { tag: true } },
      doctor: { select: { id: true, name: true, email: true } },
      media: true,
    },
  });

  if (!patient) return null;

  // DOCTOR can only access their own patients
  if (requestingUserRole === 'DOCTOR' && patient.assignedDoctorId !== requestingUserId) {
    return null;
  }

  return patient;
}

export async function createPatient(input: CreatePatientInput) {
  const { name, dob, assignedDoctorId, tags = [] } = input;

  // Upsert tags and collect their IDs
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
        create: tagRecords.map((tag) => ({ tagId: tag.id })),
      },
    },
    include: {
      tags: { include: { tag: true } },
      doctor: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function updatePatient(
  id: string,
  input: UpdatePatientInput
) {
  const { name, dob, assignedDoctorId, tags } = input;

  // If tags provided, replace them entirely
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

    // Delete existing PatientTag rows then recreate
    await prisma.patientTag.deleteMany({ where: { patientId: id } });

    return prisma.patient.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(dob ? { dob: new Date(dob) } : {}),
        ...(assignedDoctorId ? { assignedDoctorId } : {}),
        tags: {
          create: tagRecords.map((tag) => ({ tagId: tag.id })),
        },
      },
      include: {
        tags: { include: { tag: true } },
        doctor: { select: { id: true, name: true, email: true } },
      },
    });
  }

  return prisma.patient.update({
    where: { id },
    data: {
      ...(name ? { name } : {}),
      ...(dob ? { dob: new Date(dob) } : {}),
      ...(assignedDoctorId ? { assignedDoctorId } : {}),
    },
    include: {
      tags: { include: { tag: true } },
      doctor: { select: { id: true, name: true, email: true } },
    },
  });
}

export async function deletePatient(id: string) {
  return prisma.patient.delete({ where: { id } });
}
