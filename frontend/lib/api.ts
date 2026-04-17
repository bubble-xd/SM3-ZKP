import { ApiEnvelope } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
const DEFAULT_TIMEOUT_MS = 15000;

function extractEnvelope<T>(payload: unknown): ApiEnvelope<T> | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }
  const record = payload as Record<string, unknown>;
  if ("success" in record && "data" in record && "error" in record) {
    return record as ApiEnvelope<T>;
  }
  if ("detail" in record && record.detail && typeof record.detail === "object") {
    const detail = record.detail as Record<string, unknown>;
    if ("success" in detail && "data" in detail && "error" in detail) {
      return detail as ApiEnvelope<T>;
    }
  }
  return null;
}

export async function apiRequest<T>(path: string, init?: RequestInit, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<T> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {})
      }
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(`Request timed out after ${Math.round(timeoutMs / 1000)}s`);
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }

  const payload = await response.json().catch(() => null);
  const envelope = extractEnvelope<T>(payload);

  if (!response.ok || !envelope?.success || envelope.data === null) {
    const message =
      envelope?.error?.message ??
      (typeof payload === "object" && payload && "message" in (payload as Record<string, unknown>)
        ? String((payload as Record<string, unknown>).message)
        : "Request failed");
    throw new Error(message);
  }

  return envelope.data;
}

export async function postJson<T>(path: string, body: unknown, timeoutMs?: number) {
  return apiRequest<T>(path, {
    method: "POST",
    body: JSON.stringify(body)
  }, timeoutMs);
}
