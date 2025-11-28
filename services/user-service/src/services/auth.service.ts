import User, { IUser } from "../models/user.model";
import bcrypt from "bcryptjs";
import config from "../config";

export async function registerUser(email: string, password: string, name?: string) {
  const existing = await User.findOne({ email });
  if (existing) throw new Error("User already exists");
  const salt = await bcrypt.genSalt(config.bcryptSaltRounds);
  const hashed = await bcrypt.hash(password, salt);
  const user = await User.create({ email, password: hashed, name });
  return user;
}

export async function validateUser(email: string, password: string) {
  const user = await User.findOne({ email });
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return null;
  return user;
}

export async function grantRole(userId: string, docId: string, role: "viewer" | "editor") {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  const existing = user.roles.find(r => r.docId === docId);
  if (existing) {
    existing.role = role;
  } else {
    user.roles.push({ docId, role });
  }
  await user.save();
  return user;
}

export async function revokeRole(userId: string, docId: string) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  user.roles = user.roles.filter(r => r.docId !== docId);
  await user.save();
  return user;
}



