import { Router } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../../db/prisma.js";
import { requireAdmin, requireAuth, type AuthUser } from "../auth/auth.middleware.js";
import { hashPassword } from "../auth/password.js";

export const userRouter = Router();

const createUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "editor", "viewer"]).default("editor")
});

const updateUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required").optional(),
  role: z.enum(["admin", "editor", "viewer"]).optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional()
});

function formatValidationError(error: z.ZodError) {
  const flattened = error.flatten();
  const fieldMessages = Object.entries(flattened.fieldErrors)
    .flatMap(([field, messages]) => messages?.map((message) => `${field}: ${message}`) ?? []);

  return [...flattened.formErrors, ...fieldMessages].join(". ") || "Invalid user payload";
}

userRouter.use(requireAuth);
userRouter.use(requireAdmin);

userRouter.get("/", (_req, res) => {
  const actor = res.locals.user as AuthUser;

  void prisma.user
    .findMany({
      where: { teamId: actor.teamId },
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, name: true, role: true, createdAt: true }
    })
    .then((users) => res.json({ data: users }))
    .catch((error: unknown) => {
      console.error(error);
      res.status(500).json({ error: "Failed to list users" });
    });
});

userRouter.post("/", (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);
  const actor = res.locals.user as AuthUser;

  if (!parsed.success) {
    res.status(400).json({ error: formatValidationError(parsed.error), issues: parsed.error.flatten() });
    return;
  }

  void hashPassword(parsed.data.password)
    .then((passwordHash) =>
      prisma.user.create({
        data: {
          teamId: actor.teamId,
          name: parsed.data.name,
          email: parsed.data.email.toLowerCase(),
          passwordHash,
          role: parsed.data.role
        },
        select: { id: true, email: true, name: true, role: true, createdAt: true }
      })
    )
    .then((user) => res.status(201).json({ data: user }))
    .catch((error: unknown) => {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        res.status(409).json({ error: "A user with this email already exists" });
        return;
      }
      console.error(error);
      res.status(500).json({ error: "Failed to create user" });
    });
});

userRouter.patch("/:id", (req, res) => {
  const parsed = updateUserSchema.safeParse(req.body);
  const actor = res.locals.user as AuthUser;

  if (!parsed.success) {
    res.status(400).json({ error: formatValidationError(parsed.error), issues: parsed.error.flatten() });
    return;
  }

  void Promise.resolve(parsed.data.password ? hashPassword(parsed.data.password) : undefined)
    .then((passwordHash) =>
      prisma.user.update({
        where: { id: req.params.id },
        data: {
          name: parsed.data.name,
          role: parsed.data.role,
          ...(passwordHash ? { passwordHash } : {})
        },
        select: { id: true, email: true, name: true, role: true, createdAt: true }
      })
    )
    .then((user) => res.json({ data: user }))
    .catch((error: unknown) => {
      console.error(error);
      res.status(500).json({ error: "Failed to update user" });
    });
});

userRouter.delete("/:id", (req, res) => {
  const actor = res.locals.user as AuthUser;

  if (req.params.id === actor.id) {
    res.status(400).json({ error: "You cannot delete yourself" });
    return;
  }

  void prisma.user
    .findFirst({ where: { id: req.params.id, teamId: actor.teamId } })
    .then(async (user) => {
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      await prisma.user.delete({ where: { id: user.id } });
      res.status(204).send();
    })
    .catch((error: unknown) => {
      console.error(error);
      res.status(500).json({ error: "Failed to delete user" });
    });
});
