// seed.js — populates the database with initial data.
// Run with:  node prisma/seed.js
//
// This creates one default Admin user so you can immediately log in after
// running your first migration. Change the email/password before deployment.

import 'dotenv/config' // loads .env first
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import pkg from '@prisma/client'
const { PrismaClient } = pkg
import bcrypt from 'bcryptjs'

// Prisma 7 requires a driver adapter — same pattern as src/lib/prismaClient.js
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })


async function main() {
  console.log('🌱 Starting database seed...')

  // ── 1. Create the default Admin user ─────────────────────────────────────
  const adminEmail = 'admin@examportal.com'
  const adminPassword = 'Admin@1234' // change this before going live!

  // bcrypt.hash(password, saltRounds)
  // saltRounds = 10 means bcrypt runs 2^10 = 1024 hashing rounds.
  // Higher = more secure but slower. 10 is the industry standard.
  const passwordHash = await bcrypt.hash(adminPassword, 10)

  // upsert = "update if exists, insert if not"
  // This makes the seed idempotent — safe to run multiple times without
  // creating duplicate records.
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {}, // if admin already exists, do nothing (empty update)
    create: {
      name: 'Super Admin',
      email: adminEmail,
      passwordHash,
      role: 'ADMIN',
    },
  })

  console.log(`✅ Admin user ready:`)
  console.log(`   Name  : ${admin.name}`)
  console.log(`   Email : ${admin.email}`)
  console.log(`   Role  : ${admin.role}`)
  console.log(`   ID    : ${admin.id}`)

  // ── 2. Create a sample Student user (helpful for testing) ─────────────────
  const studentEmail = 'student@examportal.com'
  const studentPassword = 'Student@1234'
  const studentHash = await bcrypt.hash(studentPassword, 10)

  const student = await prisma.user.upsert({
    where: { email: studentEmail },
    update: {},
    create: {
      name: 'Test Student',
      email: studentEmail,
      passwordHash: studentHash,
      role: 'STUDENT',
    },
  })

  console.log(`\n✅ Sample Student user ready:`)
  console.log(`   Name  : ${student.name}`)
  console.log(`   Email : ${student.email}`)
  console.log(`   Role  : ${student.role}`)
  console.log(`   ID    : ${student.id}`)

  console.log('\n🎉 Seed complete!')
  console.log('\n📋 Login credentials:')
  console.log('   Admin   → admin@examportal.com   / Admin@1234')
  console.log('   Student → student@examportal.com / Student@1234')
}

// Run main(), and always disconnect Prisma when done (important — avoids hanging process)
main()
  .catch((error) => {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
