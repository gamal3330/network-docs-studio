import { Router } from "express";
import { diagramSchema } from "@nds/shared";
import { requireAuth, requireEditor } from "../auth/auth.middleware.js";
import { diagramRepository } from "./diagram.repository.js";

export const diagramRouter = Router();

diagramRouter.use(requireAuth);

diagramRouter.get("/", (_req, res) => {
  void diagramRepository
    .list()
    .then((data) => res.json({ data }))
    .catch((error: unknown) => {
      console.error(error);
      res.status(500).json({ error: "Failed to list diagrams" });
    });
});

diagramRouter.get("/:slug", (req, res) => {
  void diagramRepository
    .findBySlug(req.params.slug)
    .then((diagram) => {
      if (!diagram) {
        res.status(404).json({ error: "Diagram not found" });
        return;
      }

      res.json({ data: diagram });
    })
    .catch((error: unknown) => {
      console.error(error);
      res.status(500).json({ error: "Failed to load diagram" });
    });
});

diagramRouter.put("/:slug", requireEditor, (req, res) => {
  const parsed = diagramSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Invalid diagram payload", issues: parsed.error.flatten() });
    return;
  }

  void diagramRepository
    .save({ ...parsed.data, slug: req.params.slug })
    .then((data) => res.json({ data }))
    .catch((error: unknown) => {
      console.error(error);
      res.status(500).json({ error: "Failed to save diagram" });
    });
});

diagramRouter.post("/:slug/share-links", requireEditor, (req, res) => {
  const mode = req.body?.mode ?? "read-only";

  void diagramRepository
    .createShareLink(req.params.slug, mode)
    .then((shareLink) => {
      if (!shareLink) {
        res.status(404).json({ error: "Diagram not found" });
        return;
      }

      res.status(201).json({
        data: {
          id: shareLink.id,
          token: shareLink.token,
          url: `/connections/${req.params.slug}?share=${shareLink.token}`,
          mode: shareLink.mode
        }
      });
    })
    .catch((error: unknown) => {
      console.error(error);
      res.status(500).json({ error: "Failed to create share link" });
    });
});

diagramRouter.post("/:slug/exports", (req, res) => {
  const format = req.body?.format ?? "png";
  void diagramRepository
    .createExportJob(req.params.slug, format)
    .then((exportJob) => {
      if (!exportJob) {
        res.status(404).json({ error: "Diagram not found" });
        return;
      }

      res.status(202).json({ data: exportJob });
    })
    .catch((error: unknown) => {
      console.error(error);
      res.status(500).json({ error: "Failed to create export job" });
    });
});
