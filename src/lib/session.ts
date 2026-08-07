import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE_NAME = "admin_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

const JWT_ISSUER = "workweb";
const JWT_AUDIENCE = "workweb-admin";
const MIN_SECRET_LENGTH = 32;

export interface SessionPayload {
  sub: string;
  username: string;
}

function getJwtSecret(): Uint8Array {
  const value = process.env.JWT_SECRET;
  if (!value || value.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `JWT_SECRET must be configured with at least ${MIN_SECRET_LENGTH} characters`
    );
  }
  return new TextEncoder().encode(value);
}

export async function createSessionToken(
  payload: SessionPayload
): Promise<string> {
  return new SignJWT({ username: payload.username })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getJwtSecret());
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      algorithms: ["HS256"],
    });

    if (typeof payload.sub !== "string" || typeof payload.username !== "string") {
      return null;
    }

    return { sub: payload.sub, username: payload.username };
  } catch {
    return null;
  }
}
