/** Read a bounded JSON object without trusting Content-Length. */
export async function readJsonObject(request: Request, maxBytes: number) {
  if (Number(request.headers.get("content-length")) > maxBytes) return { status: 413 } as const;
  const reader = request.body?.getReader();
  if (!reader) return { status: 400 } as const;
  const decoder = new TextDecoder();
  let size = 0;
  let json = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) { void reader.cancel().catch(() => undefined); return { status: 413 } as const; }
      json += decoder.decode(value, { stream: true });
    }
    const body: unknown = JSON.parse(json + decoder.decode());
    if (!body || typeof body !== "object" || Array.isArray(body)) return { status: 400 } as const;
    return { body: body as Record<string, unknown>, status: 200 } as const;
  } catch {
    return { status: 400 } as const;
  } finally {
    reader.releaseLock();
  }
}
