// prisma.config.ts — Prisma 7 runtime configuration file.
// In Prisma 7, the database connection URL is managed HERE (not in schema.prisma).
// This file is read by the Prisma CLI when you run migrate, seed, or generate commands.
//
// import "dotenv/config" loads all variables from the .env file into process.env
// BEFORE Prisma tries to read DATABASE_URL — this is essential.

import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  // Points Prisma CLI to our schema file
  schema: "prisma/schema.prisma",

  // Migration files will be stored in this folder
  migrations: {
    path: "prisma/migrations",
  },

  // The actual database connection URL — read from the .env file
  // process.env["DATABASE_URL"] is the Neon connection string you pasted
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
