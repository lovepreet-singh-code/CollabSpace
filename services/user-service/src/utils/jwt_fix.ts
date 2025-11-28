import jwt from "jsonwebtoken";
import config from "../config";

export function sign(payload: object) {
  return jwt.sign(payload, config.jwtSecret as string, {
    expiresIn: config.jwtExpiresIn as any
  });
}

export function verify<T>(token: string): T {
  return jwt.verify(token, config.jwtSecret as string) as T;
}
