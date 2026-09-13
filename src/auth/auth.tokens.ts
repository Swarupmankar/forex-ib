import { jwtDecode } from 'jwt-decode';

export interface DecodedJwtPayload {
  sub?: string;
  id?: number | string;
  email?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

const EXPIRATION_BUFFER_MS = 30_000; // 30 seconds safety buffer

export function decodeToken(token: string): DecodedJwtPayload | null {
  if (!token) return null;
  try {
    return jwtDecode<DecodedJwtPayload>(token);
  } catch {
    return null;
  }
}

export function getTokenExpiration(token: string): number | null {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return null;
  return decoded.exp * 1000; // return ms
}

export function isTokenExpired(token: string, bufferMs = EXPIRATION_BUFFER_MS): boolean {
  if (!token) return true;
  const expMs = getTokenExpiration(token);
  if (!expMs) return false; // If no exp claim, assume valid token
  return Date.now() + bufferMs >= expMs;
}

export function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  return !isTokenExpired(token);
}

export function getUserIdFromToken(token: string): string | number | null {
  const decoded = decodeToken(token);
  return decoded?.id ?? decoded?.sub ?? null;
}
