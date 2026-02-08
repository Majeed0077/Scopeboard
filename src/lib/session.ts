import type { Role } from "@/lib/rbac";
import { isRole } from "@/lib/rbac";

export type SessionPayload = {
  uid: string;
  role: Role;
  exp: number;
};

const SESSION_COOKIE = "vf_session";

function getSecret() {
  return process.env.VF_SESSION_SECRET ?? "vf_dev_secret_change_me";
}

function toBase64Url(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  if (typeof btoa !== "undefined") {
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  return Buffer.from(binary, "binary")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  if (typeof atob !== "undefined") {
    return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
  }
  return Buffer.from(padded, "base64");
}

async function sign(data: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return toBase64Url(signature);
}

async function verify(data: string, signature: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const sigBytes = fromBase64Url(signature);
  return crypto.subtle.verify("HMAC", key, sigBytes, new TextEncoder().encode(data));
}

function encodeJson(value: unknown) {
  const json = JSON.stringify(value);
  if (typeof btoa !== "undefined") {
    return btoa(json).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  return Buffer.from(json).toString("base64url");
}

function decodeJson(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  if (typeof atob !== "undefined") {
    return atob(padded);
  }
  return Buffer.from(padded, "base64").toString("utf-8");
}

export async function createSessionToken(payload: Omit<SessionPayload, "exp">) {
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 7;
  const data = { ...payload, exp };
  const json = JSON.stringify(data);
  const signature = await sign(json);
  const encoded = encodeJson(data);
  return `${encoded}.${signature}`;
}

export async function parseSessionToken(token: string | undefined | null) {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  const json = decodeJson(encoded);
  const valid = await verify(json, signature);
  if (!valid) return null;
  const payload = JSON.parse(json) as SessionPayload;
  if (!isRole(payload.role)) return null;
  if (payload.exp < Date.now()) return null;
  return payload;
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}
