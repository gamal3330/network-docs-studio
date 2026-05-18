import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { prisma } from "../../db/prisma.js";

export type AuthUser = {
  id: string;
  teamId: string;
  email: string;
  name: string;
  role: string;
};

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");

  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const tokenUser = jwt.verify(token, env.JWT_SECRET) as AuthUser;

    void prisma.user
      .findUnique({
        where: { id: tokenUser.id },
        select: { id: true, teamId: true, email: true, name: true, role: true }
      })
      .then((user) => {
        if (!user) {
          res.status(401).json({ error: "Invalid token" });
          return;
        }

        res.locals.user = user;
        next();
      })
      .catch((error: unknown) => {
        console.error(error);
        res.status(500).json({ error: "Failed to verify session" });
      });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

export function requireAdmin(_req: Request, res: Response, next: NextFunction) {
  const user = res.locals.user as AuthUser | undefined;

  if (user?.role !== "admin") {
    res.status(403).json({ error: "Admin role required" });
    return;
  }

  next();
}

export function requireEditor(_req: Request, res: Response, next: NextFunction) {
  const user = res.locals.user as AuthUser | undefined;

  if (user?.role !== "admin" && user?.role !== "editor") {
    res.status(403).json({ error: "Editor role required" });
    return;
  }

  next();
}
