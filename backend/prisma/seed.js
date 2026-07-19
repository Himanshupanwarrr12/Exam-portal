import 'dotenv/config'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import pkg from '@prisma/client'
const { PrismaClient } = pkg
import bcrypt from 'bcryptjs'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Starting database seed...')

  const adminEmail = 'admin@examportal.com'
  const adminPassword = 'Admin@1234'
  const passwordHash = await bcrypt.hash(adminPassword, 10)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'Super Admin',
      email: adminEmail,
      passwordHash,
      role: 'ADMIN',
    },
  })

  console.log('Admin user ready:')
  console.log(`   Name  : ${admin.name}`)
  console.log(`   Email : ${admin.email}`)
  console.log(`   Role  : ${admin.role}`)
  console.log(`   ID    : ${admin.id}`)

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

  console.log('\nSample Student user ready:')
  console.log(`   Name  : ${student.name}`)
  console.log(`   Email : ${student.email}`)
  console.log(`   Role  : ${student.role}`)
  console.log(`   ID    : ${student.id}`)

  console.log('\nSeed complete!')
  console.log('\nLogin credentials:')
  console.log('   Admin   → admin@examportal.com   / Admin@1234')
  console.log('   Student → student@examportal.com / Student@1234')
}

main()
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
