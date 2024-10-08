import { EncryptJWT, jwtDecrypt } from "jose";
import { JWTExpired, JWEInvalid } from "jose/errors";

import { sessionToken } from "./config";
import type { Token } from "./types";

export async function encrypt(
  token: Omit<Token, "iat" | "exp">,
  issuedAt: Date,
) {
  return await new EncryptJWT(token)
    .setProtectedHeader(sessionToken.protectedHeader)
    .setIssuedAt(issuedAt)
    .encrypt(sessionToken.secret);
}

export async function decrypt(jwt: string) {
  try {
    const { payload, protectedHeader } = await jwtDecrypt<Token>(
      jwt,
      sessionToken.secret,
    );
    if (
      protectedHeader.alg !== sessionToken.protectedHeader.alg ||
      protectedHeader.enc !== sessionToken.protectedHeader.enc
    ) {
      console.error("[JWT] - Invalid protected header.");
      return null;
    }
    return payload;
  } catch (error) {
    if (error instanceof JWTExpired) {
      console.error("[JWT] - Token expired when decrypted.");
    } else if (error instanceof JWEInvalid) {
      console.error(`[JWT] - ${error.message}`);
    } else {
      console.error(error);
    }
    return null;
  }
}
