/**
 * Shared input validation and sanitization utilities.
 * Used across the app to prevent injection attacks, validate data shapes,
 * and handle malformed API responses gracefully.
 */

const VALID_US_STATES = new Set([
  "All States / National",
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","District of Columbia","Florida","Georgia","Hawaii","Idaho","Illinois",
  "Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts",
  "Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada",
  "New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota",
  "Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina",
  "South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington",
  "West Virginia","Wisconsin","Wyoming",
]);

const BANNED_PATTERNS = /(<\s*script[^>]*>|<\s*\/\s*script\s*>|<[^>]+>)/gi;
const SQL_KEYWORDS = /\b(DROP|SELECT|INSERT|DELETE|UNION|UPDATE|ALTER|EXEC|EXECUTE|TRUNCATE|CREATE|REPLACE)\b/i;
const DANGEROUS_CHARS = /[<>"';]/;

const MAX_DEFAULT_LENGTH = 200;
const MAX_RESPONSE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Strip HTML/script tags, trim whitespace, and enforce max length.
 */
export function sanitizeInput(text: string, maxLength = MAX_DEFAULT_LENGTH): string {
  if (typeof text !== "string") return "";
  return text
    .replace(BANNED_PATTERNS, "")
    .trim()
    .slice(0, maxLength);
}

/**
 * Validate a state value against the known US states whitelist.
 */
export function isValidState(state: string): boolean {
  return VALID_US_STATES.has(state);
}

/**
 * Validate a search name: non-empty, within length, no dangerous chars or SQL keywords.
 */
export function isValidName(name: string): { valid: boolean; reason?: string } {
  if (!name || typeof name !== "string") {
    return { valid: false, reason: "Name is required." };
  }
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return { valid: false, reason: "Name cannot be empty." };
  }
  if (trimmed.length > MAX_DEFAULT_LENGTH) {
    return { valid: false, reason: `Name must be under ${MAX_DEFAULT_LENGTH} characters.` };
  }
  if (DANGEROUS_CHARS.test(trimmed)) {
    return { valid: false, reason: "Name contains invalid characters." };
  }
  if (SQL_KEYWORDS.test(trimmed)) {
    return { valid: false, reason: "Name contains disallowed keywords." };
  }
  return { valid: true };
}

/**
 * Safe JSON.parse wrapper. Returns null on failure instead of throwing.
 */
export function safeJsonParse<T = unknown>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

/**
 * Validate that an API response object contains the expected fields.
 * Returns { valid, missing } where missing lists any absent required fields.
 */
export function validateApiResponse(
  data: unknown,
  requiredFields: string[]
): { valid: boolean; missing: string[] } {
  if (data == null || typeof data !== "object") {
    return { valid: false, missing: requiredFields };
  }
  const obj = data as Record<string, unknown>;
  const missing = requiredFields.filter((f) => !(f in obj));
  return { valid: missing.length === 0, missing };
}

/**
 * Validate and sanitize a URL search parameter.
 * Returns sanitized value or null if invalid.
 */
export function sanitizeUrlParam(value: string | null, maxLength = MAX_DEFAULT_LENGTH): string | null {
  if (!value) return null;
  if (value.length > maxLength) return null;
  // Reject script tags and HTML
  if (BANNED_PATTERNS.test(value)) return null;
  return value.trim();
}

/**
 * Check if a fetch response body might exceed our size limit.
 * Returns true if the response is safe to consume.
 */
export function isResponseSizeSafe(response: Response): boolean {
  const contentLength = response.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_RESPONSE_SIZE) {
    return false;
  }
  return true;
}

/**
 * Safely access a nested property, returning a fallback if undefined/null.
 */
export function safeGet<T>(obj: unknown, path: string, fallback: T): T {
  if (obj == null || typeof obj !== "object") return fallback;
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return fallback;
    current = (current as Record<string, unknown>)[part];
  }
  return (current as T) ?? fallback;
}

/**
 * Server-side (edge function) input validation for name + state.
 */
export function validateSearchInput(name: unknown, state: unknown): { valid: boolean; error?: string } {
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return { valid: false, error: "name is required and must be a non-empty string" };
  }
  if (name.length > MAX_DEFAULT_LENGTH) {
    return { valid: false, error: `name must be under ${MAX_DEFAULT_LENGTH} characters` };
  }
  if (DANGEROUS_CHARS.test(name)) {
    return { valid: false, error: "name contains invalid characters" };
  }
  if (SQL_KEYWORDS.test(name)) {
    return { valid: false, error: "name contains disallowed keywords" };
  }
  if (state != null && typeof state !== "string") {
    return { valid: false, error: "state must be a string" };
  }
  if (typeof state === "string" && state.length > 50) {
    return { valid: false, error: "state value is too long" };
  }
  return { valid: true };
}
