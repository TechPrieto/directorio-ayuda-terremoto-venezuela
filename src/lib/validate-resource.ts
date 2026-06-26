import type { ResourceStatus, ValidationResult } from "./types";

// Señales de página genuinamente muerta o estacionada. NO incluir "login"/"sign in":
// muchos recursos legítimos (Instagram, apps con cuenta) son login walls y entran bien
// para un humano. Penalizarlos los marcaba como "Con problemas" siendo válidos.
const parkedSignals = [
  "domain for sale",
  "buy this domain",
  "this domain is parked",
  "parked free",
  "deployment not found",
  "application error",
];

// Códigos que significan "el servidor está vivo pero nos bloquea o pide cuenta".
// No son caídas: un usuario con navegador real (o con login) entra normal. Bot-protection
// de Cloudflare suele responder 403; login walls, 401. Tratarlos como operativos.
const reachableButBlocked = new Set([401, 403, 405, 406, 429]);

// Plataformas que son login walls por diseño: siempre válidas como destino, aunque su
// HTML público sea solo un formulario de acceso. Evita falsos "Con problemas".
const alwaysReachableHosts = [
  "instagram.com",
  "facebook.com",
  "x.com",
  "twitter.com",
  "tiktok.com",
  "t.me",
  "wa.me",
  "chat.whatsapp.com",
];

function hostMatches(normalizedUrl: string, hosts: string[]) {
  try {
    const host = new URL(normalizedUrl).hostname.replace(/^www\./, "");
    return hosts.some((h) => host === h || host.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

function extractMeta(content: string, normalizedUrl: string) {
  const title =
    content.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() ??
    new URL(normalizedUrl).hostname.replace(/^www\./, "");
  const description =
    content
      .match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i)?.[1]
      ?.trim() ??
    content
      .match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i)?.[1]
      ?.trim() ??
    null;
  const text = content
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 5000);

  return {
    pageTitle: title.replace(/\s+/g, " ").slice(0, 120),
    pageDescription: description?.replace(/\s+/g, " ").slice(0, 260) ?? null,
    pageText: text,
  };
}

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

    // El servidor respondió pero nos bloquea (bot-protection) o pide login: está vivo.
    if (reachableButBlocked.has(response.status)) {
      return {
        ok: true,
        normalizedUrl,
        status: "operational",
        responseMs,
        reason: null,
        pageTitle: new URL(normalizedUrl).hostname.replace(/^www\./, ""),
        pageDescription: null,
        pageText: null,
      };
    }

    // Plataformas que son login walls por diseño: válidas como destino sin leer el cuerpo.
    if (hostMatches(normalizedUrl, alwaysReachableHosts)) {
      return {
        ok: true,
        normalizedUrl,
        status: "operational",
        responseMs,
        reason: null,
        pageTitle: new URL(normalizedUrl).hostname.replace(/^www\./, ""),
        pageDescription: null,
        pageText: null,
      };
    }

    // Solo es caída si el servidor falla de verdad (404, 5xx, etc.).
    if (response.status < 200 || response.status >= 400) {
      return {
        ok: false,
        normalizedUrl,
        status: "down",
        responseMs,
        reason: `El sitio respondió HTTP ${response.status}.`,
      };
    }

    const text = await response.text();
    const compact = text.replace(/\s+/g, " ").trim();
    const lower = compact.toLowerCase();

    // HTML casi vacío suele ser un SPA que hidrata con JS (app reachable), no una caída.
    // Solo lo tratamos como degradado si además trae señales de página muerta (abajo).
    if (compact.length < 30) {
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
      ...extractMeta(text, normalizedUrl),
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
