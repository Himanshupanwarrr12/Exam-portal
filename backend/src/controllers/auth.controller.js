// src/controllers/auth.controller.js
//
// Contains the business logic for the two auth endpoints:
//   POST /api/auth/register  → create a new student account
//   POST /api/auth/login     → verify credentials and issue a JWT
//
// A controller function receives (req, res) from Express and is responsible
// for validating input, interacting with the DB via Prisma, and sending a response.

import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prismaClient.js'

// ── REGISTER ──────────────────────────────────────────────────────────────────
// POST /api/auth/register
// Body: { name, email, password }
// Role is always set to STUDENT — Admins are created only via the seed script.
// This prevents someone from registering as an admin through the public API.

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // ── 1. Basic input validation ────────────────────────────────────────────
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' })
    }

    // Simple email format check using a regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' })
    }

    // ── 2. Check if email already exists ────────────────────────────────────
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (existingUser) {
      // 409 Conflict — the resource (email) already exists
      return res.status(409).json({ message: 'An account with this email already exists.' })
    }

    // ── 3. Hash the password ─────────────────────────────────────────────────
    // NEVER store plain text passwords. bcrypt.hash() runs the password through
    // 2^10 (1024) rounds of hashing — slow on purpose to resist brute-force attacks.
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // ── 4. Create the user in the database ───────────────────────────────────
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        role: 'STUDENT', // always STUDENT via self-registration
      },
      // Only return safe fields — never return passwordHash to the client
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    // ── 5. Respond with 201 Created ──────────────────────────────────────────
    return res.status(201).json({
      message: 'Account created successfully. You can now log in.',
      user: newUser,
    })
  } catch (error) {
    console.error('Register error:', error)
    return res.status(500).json({ message: 'Server error. Please try again.' })
  }
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// Body: { email, password }
// Returns: { token, user: { id, name, email, role } }

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // ── 1. Input validation ──────────────────────────────────────────────────
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' })
    }

    // ── 2. Find user by email ────────────────────────────────────────────────
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    // SECURITY: use the same error message whether the email doesn't exist OR
    // the password is wrong — this prevents attackers from discovering valid emails
    // (known as "user enumeration").
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    // ── 3. Compare password with the stored hash ─────────────────────────────
    // bcrypt.compare() hashes the incoming password with the same salt used
    // when the hash was first created, then compares the results.
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash)

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    // ── 4. Sign a JWT ────────────────────────────────────────────────────────
    // jwt.sign(payload, secret, options)
    //   payload — data embedded in the token; keep it small (don't put sensitive data here)
    //   secret  — from .env; used to create the signature that proves the token is legit
    //   expiresIn — after this time, the token is invalid and the user must log in again
    const token = jwt.sign(
      {
        userId: user.id,   // used by middleware to identify the current user
        role: user.role,   // used by role guards (requireAdmin / requireStudent)
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    // ── 5. Respond — send token + safe user object ───────────────────────────
    // The token goes to the frontend, which stores it in localStorage
    // and attaches it to every subsequent API request.
    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ message: 'Server error. Please try again.' })
  }
}

// ── GET CURRENT USER ──────────────────────────────────────────────────────────
// GET /api/auth/me — protected route (verifyToken required)
// Lets the frontend verify a stored token is still valid and refresh the user object.
// Called on app start to check if the saved token is still good.

export const getMe = async (req, res) => {
  try {
    // req.user is set by verifyToken middleware — contains { userId, role }
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found.' })
    }

    return res.status(200).json({ user })
  } catch (error) {
    console.error('GetMe error:', error)
    return res.status(500).json({ message: 'Server error.' })
  }
}
