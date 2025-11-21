import Document, { IDocument, ICollaborator, RoleType } from "../models/document.model";
import { Types } from "mongoose";

export async function createDocument(ownerId: string, title: string, description?: string) {
  const doc = await Document.create({
    title,
    description,
    ownerId,
    collaborators: []
  });
  return doc;
}

export async function getDocumentById(id: string) {
  if (!Types.ObjectId.isValid(id)) return null;
  const doc = await Document.findById(id).lean();
  return doc;
}

export async function updateDocument(id: string, updates: Partial<IDocument>) {
  const doc = await Document.findByIdAndUpdate(id, updates, { new: true });
  return doc;
}

export async function deleteDocument(id: string) {
  return Document.findByIdAndDelete(id);
}

export async function addOrUpdateCollaborator(docId: string, userId: string, role: RoleType) {
  const doc = await Document.findById(docId);
  if (!doc) throw new Error("Document not found");
  const idx = doc.collaborators.findIndex(c => c.userId === userId);
  if (idx >= 0) {
    doc.collaborators[idx].role = role;
    doc.collaborators[idx].addedAt = new Date();
  } else {
    doc.collaborators.push({ userId, role, addedAt: new Date() } as ICollaborator);
  }
  await doc.save();
  return doc;
}

export async function removeCollaborator(docId: string, userId: string) {
  const doc = await Document.findById(docId);
  if (!doc) throw new Error("Document not found");
  doc.collaborators = doc.collaborators.filter(c => c.userId !== userId);
  await doc.save();
  return doc;
}

export async function listDocsForUser(userId: string) {
  // owner or collaborator
  return Document.find({
    $or: [{ ownerId: userId }, { "collaborators.userId": userId }]
  }).lean();
}

export function userHasRole(doc: IDocument | null, userId: string): RoleType | null {
  if (!doc) return null;
  if (doc.ownerId === userId) return "editor";
  const coll = (doc.collaborators || []).find(c => c.userId === userId);
  return coll ? (coll.role as RoleType) : null;
}
