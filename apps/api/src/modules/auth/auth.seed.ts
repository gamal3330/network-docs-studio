import { prisma } from "../../db/prisma.js";
import { hashPassword } from "./password.js";

export async function ensureAdminUser() {
  await prisma.team.upsert({
    where: { slug: "core" },
    update: {},
    create: {
      id: "team-core",
      name: "Core Network Team",
      slug: "core"
    }
  });

  const existingAdmin = await prisma.user.findFirst({
    where: { teamId: "team-core", role: "admin" }
  });

  const passwordHash = await hashPassword("admin@123");

  if (existingAdmin) {
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        email: "admin@qtbbank.com",
        name: existingAdmin.name || "Admin",
        passwordHash,
        role: "admin"
      }
    });
    return;
  }

  await prisma.user.upsert({
    where: { email: "admin@qtbbank.com" },
    update: { passwordHash, role: "admin" },
    create: {
      teamId: "team-core",
      name: "Admin",
      email: "admin@qtbbank.com",
      passwordHash,
      role: "admin"
    }
  });
}
