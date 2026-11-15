import { createHash, randomBytes } from "node:crypto";

export function createSecureToken() {
  const token = randomBytes(32).toString("base64url");
  return {
    token,
    tokenHash: hashConfirmationToken(token),
  };
}

export const createConfirmationToken = createSecureToken;

export function hashConfirmationToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
