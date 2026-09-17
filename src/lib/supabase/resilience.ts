const DEFAULT_TIMEOUT_MS = 8_000;

export class SupabaseTimeoutError extends Error {
  constructor(message = "Supabase request timed out.") {
    super(message);
    this.name = "SupabaseTimeoutError";
  }
}

/** Prevent hung requests when a Supabase project is paused or unreachable. */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new SupabaseTimeoutError());
    }, timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

export function isSupabaseUnavailableError(error: unknown): boolean {
  if (error instanceof SupabaseTimeoutError) return true;
  if (!error || typeof error !== "object") return false;

  const e = error as { message?: string; code?: string; status?: number };
  const message = (e.message ?? "").toLowerCase();

  return (
    message.includes("fetch failed") ||
    message.includes("network") ||
    message.includes("timed out") ||
    message.includes("timeout") ||
    message.includes("paused") ||
    message.includes("project is inactive") ||
    message.includes("502") ||
    message.includes("503") ||
    message.includes("504") ||
    e.code === "PGRST301" ||
    e.status === 502 ||
    e.status === 503 ||
    e.status === 504
  );
}

export function humanizeSupabaseUnavailable(error: unknown): string {
  if (error instanceof SupabaseTimeoutError) {
    return "Cloud sync is taking too long. Using data saved on this device.";
  }
  if (isSupabaseUnavailableError(error)) {
    return "Cloud sync is unavailable right now. Your bar on this device still works.";
  }
  return "Could not reach the server. Using data saved on this device.";
}
