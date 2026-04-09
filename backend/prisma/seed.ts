import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ── Users ─────────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('admin123', 12);
  const doctorHash = await bcrypt.hash('doctor123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@hospital.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@hospital.com',
      passwordHash: adminHash,
      role: 'ADMIN',
    },
  });

  const doctor = await prisma.user.upsert({
    where: { email: 'doctor@hospital.com' },
    update: {},
    create: {
      name: 'Dr. Jane Smith',
      email: 'doctor@hospital.com',
      passwordHash: doctorHash,
      role: 'DOCTOR',
    },
  });

  console.log(`Created admin: ${admin.email}`);
  console.log(`Created doctor: ${doctor.email}`);

  // ── Tags ──────────────────────────────────────────────────────────────────
  const tagNames = ['cardiology', 'diabetes', 'hypertension', 'oncology', 'neurology'];
  const tags = await Promise.all(
    tagNames.map((name) =>
      prisma.tag.upsert({ where: { name }, update: {}, create: { name } })
    )
  );

  // ── Patients ──────────────────────────────────────────────────────────────
  const patients = [
    { name: 'John Doe',      dob: '1980-03-15', tags: ['cardiology', 'hypertension'] },
    { name: 'Mary Johnson',  dob: '1975-07-22', tags: ['diabetes'] },
    { name: 'Robert Brown',  dob: '1990-11-05', tags: ['neurology'] },
    { name: 'Emily Davis',   dob: '1985-01-30', tags: ['oncology', 'cardiology'] },
    { name: 'Michael Wilson',dob: '1968-09-12', tags: ['hypertension', 'diabetes'] },
  ];

  for (const p of patients) {
    const tagIds = tags
      .filter((t) => p.tags.includes(t.name))
      .map((t) => t.id);

    await prisma.patient.create({
      data: {
        name: p.name,
        dob: new Date(p.dob),
        assignedDoctorId: doctor.id,
        tags: {
          create: tagIds.map((tagId) => ({ tagId })),
        },
      },
    });
    console.log(`Created patient: ${p.name}`);
  }

  console.log('\nSeed complete.');
  console.log('─────────────────────────────');
  console.log('Login credentials:');
  console.log('  ADMIN  → admin@hospital.com  / admin123');
  console.log('  DOCTOR → doctor@hospital.com / doctor123');
  console.log('─────────────────────────────');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
