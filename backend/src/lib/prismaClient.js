// src/lib/prismaClient.js — Singleton Prisma Client instance.
//
// WHY a singleton? PrismaClient opens a connection pool to the database.
// If we create a new PrismaClient() in every file that needs DB access,
// we'd open too many connections. By creating ONE instance here and
// importing it everywhere, we share a single connection pool.
//
// PRISMA 7 ARCHITECTURE CHANGE:
// Prisma 7 removed the built-in Rust query engine. Instead, it requires a
// "Driver Adapter" — a JavaScript bridge between Prisma and the actual database driver.
// For PostgreSQL (Neon), we use:
//   - 'pg'               → the Node.js PostgreSQL driver (handles the TCP connection)
//   - '@prisma/adapter-pg' → wraps 'pg' so Prisma can use it
// This replaces the old approach where Prisma managed connections internally.

import 'dotenv/config' // must be first — loads DATABASE_URL from .env into process.env

// The pg Pool manages a pool of PostgreSQL connections (reuses connections efficiently)
import { Pool } from 'pg'

// PrismaPg is the adapter that bridges Prisma's query engine with the pg driver
import { PrismaPg } from '@prisma/adapter-pg'

// @prisma/client is a CommonJS module — must use default import in ES module projects
import pkg from '@prisma/client'
const { PrismaClient } = pkg

// Step 1: Create a connection pool using the DATABASE_URL from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Step 2: Wrap the pool in Prisma's pg adapter
const adapter = new PrismaPg(pool)

// Step 3: Create PrismaClient with the adapter — required in Prisma 7
const prisma = new PrismaClient({ adapter })

export default prisma
