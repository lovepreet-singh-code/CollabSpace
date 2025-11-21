import jwt from "jsonwebtoken";
import config from "../config";

export function createShareToken(docId: string, role: "viewer" | "editor") {
  return jwt.sign({ docId, role }, config.shareTokenSecret, {
    expiresIn: config.shareExpiresIn
  } as any);
}

export function verifyShareToken(token: string): { docId: string; role: string } {
  return jwt.verify(token, config.shareTokenSecret) as any;
}
