import { PrismaClient } from "@prisma/client";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const prisma = new PrismaClient();

export async function initializeDatabase() {
  const sqlPath = await findSqliteInitPath();
  const sql = await readFile(sqlPath, "utf8");
  const statements = sql
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    try {
      await prisma.$executeRawUnsafe(statement);
    } catch (error) {
      if (error instanceof Error && error.message.includes("duplicate column name")) {
        continue;
      }
      throw error;
    }
  }
}

async function findSqliteInitPath() {
  const candidates = [
    path.resolve(process.cwd(), "prisma/sqlite-init.sql"),
    path.resolve(process.cwd(), "apps/api/prisma/sqlite-init.sql")
  ];

  for (const candidate of candidates) {
    try {
      await readFile(candidate, "utf8");
      return candidate;
    } catch {
      // Try the next runtime layout.
    }
  }

  throw new Error("Unable to find prisma/sqlite-init.sql");
}
