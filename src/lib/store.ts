import { promises as fs } from "node:fs";
import path from "node:path";
import { seedResources } from "./seed-resources";
import { idFromNameAndUrl } from "./slug";
import type { Resource, ResourceInput, ResourceStatus } from "./types";

type DbResource = {
  id: string;
  name: string;
  url: string;
  category: string;
  summary: string;
  zone: string;
  tags: string[];
  status: ResourceStatus;
  trust: Resource["trust"];
  created_at: string;
  last_checked_at: string | null;
  last_manual_review_at: string | null;
  response_ms: number | null;
  failure_reason: string | null;
  consecutive_failures: number;
  clicks_24h?: number;
  clicks_7d?: number;
};

const dataDir = process.env.VERCEL
  ? path.join("/tmp", "directorio-ayuda-terremoto-venezuela")
  : path.join(process.cwd(), ".data");
const dataFile = path.join(dataDir, "resources.json");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function hasSupabase() {
  return Boolean(supabaseUrl && supabaseServiceKey);
}

function dbHeaders() {
  return {
    apikey: supabaseServiceKey ?? "",
    authorization: `Bearer ${supabaseServiceKey}`,
    "content-type": "application/json",
    prefer: "return=representation",
  };
}

function fromDb(row: DbResource): Resource {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    category: row.category,
    summary: row.summary,
    zone: row.zone,
    tags: row.tags,
    status: row.status,
    trust: row.trust,
    clicks24h: row.clicks_24h ?? 0,
    clicks7d: row.clicks_7d ?? 0,
    createdAt: row.created_at,
    lastCheckedAt: row.last_checked_at,
    lastManualReviewAt: row.last_manual_review_at,
    responseMs: row.response_ms,
    failureReason: row.failure_reason,
    consecutiveFailures: row.consecutive_failures,
  };
}

function toDb(resource: Resource) {
  return {
    id: resource.id,
    name: resource.name,
    url: resource.url,
    category: resource.category,
    summary: resource.summary,
    zone: resource.zone,
    tags: resource.tags,
    status: resource.status,
    trust: resource.trust,
    created_at: resource.createdAt,
    last_checked_at: resource.lastCheckedAt,
    last_manual_review_at: resource.lastManualReviewAt,
    response_ms: resource.responseMs,
    failure_reason: resource.failureReason,
    consecutive_failures: resource.consecutiveFailures,
  };
}

async function readLocalResources(): Promise<Resource[]> {
  try {
    const raw = await fs.readFile(dataFile, "utf8");
    return JSON.parse(raw) as Resource[];
  } catch {
    return seedResources;
  }
}

async function writeLocalResources(resources: Resource[]) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(dataFile, JSON.stringify(resources, null, 2));
}

export async function listResources(): Promise<Resource[]> {
  if (!hasSupabase()) {
    return readLocalResources();
  }

  const response = await fetch(
    `${supabaseUrl}/rest/v1/resources_with_usage?select=*&order=category.asc,name.asc`,
    { headers: dbHeaders(), cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error(`Supabase list failed: ${response.status}`);
  }

  const rows = (await response.json()) as DbResource[];
  return rows.map(fromDb);
}

export async function getResource(id: string) {
  const resources = await listResources();
  return resources.find((resource) => resource.id === id) ?? null;
}

export async function addResource(
  input: ResourceInput,
  normalizedUrl: string,
  status: ResourceStatus,
  responseMs: number | null,
) {
  const resources = await listResources();
  const duplicate = resources.find(
    (resource) =>
      resource.url.replace(/\/$/, "") === normalizedUrl.replace(/\/$/, ""),
  );

  if (duplicate) {
    return { resource: duplicate, duplicate: true };
  }

  const now = new Date().toISOString();
  const resource: Resource = {
    id: idFromNameAndUrl(input.name, normalizedUrl),
    name: input.name.trim(),
    url: normalizedUrl,
    category: input.category,
    summary: input.summary.trim(),
    zone: input.zone.trim() || "Venezuela",
    tags: input.tags?.length
      ? input.tags
      : [
          input.trustClaim === "official" ? "Oficial declarado" : "No oficial",
          "Nuevo recurso",
        ],
    status,
    trust: "unofficial",
    clicks24h: 0,
    clicks7d: 0,
    createdAt: now,
    lastCheckedAt: now,
    lastManualReviewAt: null,
    responseMs,
    failureReason: null,
    consecutiveFailures: 0,
  };

  if (hasSupabase()) {
    const response = await fetch(`${supabaseUrl}/rest/v1/resources`, {
      method: "POST",
      headers: dbHeaders(),
      body: JSON.stringify(toDb(resource)),
    });

    if (!response.ok) {
      throw new Error(`Supabase insert failed: ${response.status}`);
    }
  } else {
    await writeLocalResources([...resources, resource]);
  }

  return { resource, duplicate: false };
}

export async function updateResourceHealth(
  resource: Resource,
  status: ResourceStatus,
  responseMs: number | null,
  failureReason: string | null,
) {
  const nextFailures =
    status === "operational" ? 0 : resource.consecutiveFailures + 1;
  const nextStatus =
    nextFailures >= 3 ? "down" : nextFailures >= 2 ? "degraded" : status;
  const updated: Resource = {
    ...resource,
    status: nextStatus,
    responseMs,
    failureReason,
    consecutiveFailures: nextFailures,
    lastCheckedAt: new Date().toISOString(),
  };

  if (hasSupabase()) {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/resources?id=eq.${encodeURIComponent(resource.id)}`,
      {
        method: "PATCH",
        headers: dbHeaders(),
        body: JSON.stringify(toDb(updated)),
      },
    );

    if (!response.ok) {
      throw new Error(`Supabase update failed: ${response.status}`);
    }
  } else {
    const resources = await readLocalResources();
    await writeLocalResources(
      resources.map((item) => (item.id === resource.id ? updated : item)),
    );
  }

  return updated;
}

export async function recordClick(resource: Resource, request: Request) {
  if (!hasSupabase()) {
    return;
  }

  await fetch(`${supabaseUrl}/rest/v1/resource_clicks`, {
    method: "POST",
    headers: dbHeaders(),
    body: JSON.stringify({
      resource_id: resource.id,
      category: resource.category,
      referrer: request.headers.get("referer"),
      user_agent: request.headers.get("user-agent"),
      country: request.headers.get("x-vercel-ip-country"),
      city: request.headers.get("x-vercel-ip-city"),
    }),
  });
}
