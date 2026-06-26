import type { ResourceStatus, ValidationResult } from "./types";

const parkedSignals = [
  "domain for sale",
  "buy this domain",
  "parked free",
  "coming soon",
  "deployment not found",
  "404: not found",
  "application error",
  "internal server error",
  "sign in",
  "login",
];

export function normalizeUrl(value: string) {
  const trimmed = value.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  const parsed = new URL(withProtocol);
  parsed.hash = "";
  return parsed.toString();
}

export async function validateResourceUrl(
  rawUrl: string,
): Promise<ValidationResult> {
  let normalizedUrl = "";
  const started = Date.now();

  try {
    normalizedUrl = normalizeUrl(rawUrl);
  } catch {
    return {
      ok: false,
      normalizedUrl: rawUrl,
      status: "down",
      responseMs: null,
      reason: "URL inválida.",
    };
  }

  try {
    const response = await fetch(normalizedUrl, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
      headers: {
        "user-agent":
          "DirectorioAyudaTerremotoVenezuela/1.0 (+https://vercel.app)",
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    const responseMs = Date.now() - started;
    const status: ResourceStatus =
      response.status >= 200 && response.status < 400 ? "operational" : "down";

    if (status !== "operational") {
      return {
        ok: false,
        normalizedUrl,
        status,
        responseMs,
        reason: `El sitio respondió HTTP ${response.status}.`,
      };
    }

    const contentType = response.headers.get("content-type") ?? "";
    const text = await response.text();
    const compact = text.replace(/\s+/g, " ").trim();
    const lower = compact.toLowerCase();

    if (contentType.includes("text/html") && compact.length < 180) {
      return {
        ok: false,
        normalizedUrl,
        status: "degraded",
        responseMs,
        reason: "La página cargó, pero parece vacía.",
      };
    }

    const parked = parkedSignals.find((signal) => lower.includes(signal));
    if (parked) {
      return {
        ok: false,
        normalizedUrl,
        status: "degraded",
        responseMs,
        reason: `La página parece no operativa: ${parked}.`,
      };
    }

    return {
      ok: true,
      normalizedUrl,
      status: "operational",
      responseMs,
      reason: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido.";
    return {
      ok: false,
      normalizedUrl,
      status: "down",
      responseMs: Date.now() - started,
      reason: message,
    };
  }
}
