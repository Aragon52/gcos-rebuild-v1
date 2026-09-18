/**
 * The `system_settings.value` column is a plain text column. Structured
 * settings (like the deposit configuration) are stored as a JSON string, so
 * they must be stringified on write and parsed on read.
 */
export interface DepositConfig {
  usdtAddress?: string;
  qrCodeUrl?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export function parseSettingValue<T>(value: unknown): T | null {
  if (!value) return null;
  if (typeof value === "object") return value as T;
  if (typeof value !== "string") return null;
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed && typeof parsed === "object" ? (parsed as T) : null;
  } catch {
    return null;
  }
}

export function serializeSettingValue(value: Record<string, unknown>): string {
  return JSON.stringify(value);
}
