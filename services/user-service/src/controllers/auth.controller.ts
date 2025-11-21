import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { sign } from "../utils/jwt";

export async function register(req: Request, res: Response) {
  const { email, password, name } = req.body;
  const user = await authService.registerUser(email, password, name);
  res.status(201).json({ id: user._id, email: user.email, name: user.name });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const user = await authService.validateUser(email, password);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const token = sign({ userId: user._id, email: user.email });
  res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
}

export async function me(req: Request, res: Response) {
  // `req.user` set by auth middleware
  const user = (req as any).user;
  res.json({ id: user._id, email: user.email, name: user.name, roles: user.roles });
}

export async function grant(req: Request, res: Response) {
  const { userId, docId, role } = req.body;
  const u = await authService.grantRole(userId, docId, role);
  res.json({ id: u._id, roles: u.roles });
}

export async function revoke(req: Request, res: Response) {
  const { userId, docId } = req.body;
  const u = await authService.revokeRole(userId, docId);
  res.json({ id: u._id, roles: u.roles });
}
