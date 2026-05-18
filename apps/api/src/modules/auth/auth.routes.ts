import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../../config/env.js";
import { prisma } from "../../db/prisma.js";
import { requireAuth } from "./auth.middleware.js";
import { verifyPassword } from "./password.js";

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

authRouter.post("/login", (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid login payload" });
    return;
  }

  void prisma.user
    .findUnique({ where: { email: parsed.data.email.toLowerCase() } })
    .then(async (user) => {
      if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
      }

      const safeUser = {
        id: user.id,
        teamId: user.teamId,
        email: user.email,
        name: user.name,
        role: user.role
      };
      const token = jwt.sign(safeUser, env.JWT_SECRET, { expiresIn: "7d" });

      res.json({ data: { token, user: safeUser } });
    })
    .catch((error: unknown) => {
      console.error(error);
      res.status(500).json({ error: "Login failed" });
    });
});

authRouter.get("/me", requireAuth, (_req, res) => {
  res.json({ data: res.locals.user });
});
