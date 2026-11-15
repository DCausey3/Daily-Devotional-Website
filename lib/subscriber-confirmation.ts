import { createHash, randomBytes } from "node:crypto";

export function createConfirmationToken() {
  const token = randomBytes(32).toString("base64url");
  return {
    token,
    tokenHash: hashConfirmationToken(token),
  };
}

export function hashConfirmationToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
