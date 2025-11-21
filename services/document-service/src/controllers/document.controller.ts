import { Request, Response } from "express";
import * as docService from "../services/document.service";
import { createShareToken } from "../utils/shareToken";

export async function createDoc(req: Request, res: Response) {
  const { title, description } = req.body;
  const user = (req as any).user;
  if (!title) return res.status(400).json({ message: "Title is required" });
  const doc = await docService.createDocument(user.id, title, description);
  res.status(201).json(doc);
}

export async function getDoc(req: Request, res: Response) {
  const id = req.params.id;
  const doc = await docService.getDocumentById(id);
  if (!doc) return res.status(404).json({ message: "Document not found" });
  res.json(doc);
}

export async function updateDoc(req: Request, res: Response) {
  const id = req.params.id;
  const { title, description, isPublic } = req.body;
  const doc = await docService.getDocumentById(id);
  if (!doc) return res.status(404).json({ message: "Document not found" });

  const user = (req as any).user;
  const role = docService.userHasRole(doc as any, user.id);
  if (!role || role !== "editor") {
    // only editors (or owner) can update metadata
    return res.status(403).json({ message: "Forbidden: need editor role" });
  }
  const updated = await docService.updateDocument(id, { title, description, isPublic } as any);
  res.json(updated);
}

export async function deleteDoc(req: Request, res: Response) {
  const id = req.params.id;
  const doc = await docService.getDocumentById(id);
  if (!doc) return res.status(404).json({ message: "Document not found" });

  const user = (req as any).user;
  if (doc.ownerId !== user.id) {
    return res.status(403).json({ message: "Only owner can delete document" });
  }
  await docService.deleteDocument(id);
  res.json({ ok: true });
}

export async function shareDoc(req: Request, res: Response) {
  const id = req.params.id;
  const { role = "viewer", expiresIn } = req.body; // role: viewer/editor
  const doc = await docService.getDocumentById(id);
  if (!doc) return res.status(404).json({ message: "Document not found" });

  const user = (req as any).user;
  const userRole = docService.userHasRole(doc as any, user.id);
  if (!userRole) return res.status(403).json({ message: "Forbidden" });

  // create share token (role enforced by the token)
  const token = createShareToken(id, role);
  const link = `/share/${token}`; // front-end or gateway will transform to full URL
  res.json({ token, link, expiresIn: config.shareExpiresIn });
}

import config from "../config";

export async function addCollaborator(req: Request, res: Response) {
  const id = req.params.id;
  const { userId, role } = req.body;
  if (!userId || !role) return res.status(400).json({ message: "userId and role required" });
  const doc = await docService.getDocumentById(id);
  if (!doc) return res.status(404).json({ message: "Document not found" });
  const user = (req as any).user;
  // only owner or editors who can manage collaborators? Here restrict to owner only:
  if (doc.ownerId !== user.id) {
    return res.status(403).json({ message: "Only owner can add collaborators" });
  }
  const updated = await docService.addOrUpdateCollaborator(id, userId, role);
  res.json(updated);
}

export async function removeCollaborator(req: Request, res: Response) {
  const id = req.params.id;
  const userId = req.params.userId;
  const doc = await docService.getDocumentById(id);
  if (!doc) return res.status(404).json({ message: "Document not found" });
  const user = (req as any).user;
  if (doc.ownerId !== user.id) {
    return res.status(403).json({ message: "Only owner can remove collaborator" });
  }
  const updated = await docService.removeCollaborator(id, userId);
  res.json(updated);
}

export async function listDocs(req: Request, res: Response) {
  const user = (req as any).user;
  const docs = await docService.listDocsForUser(user.id);
  res.json(docs);
}
