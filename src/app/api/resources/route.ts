import { NextResponse } from "next/server";
import {
  addResource,
  deleteResource,
  listResources,
  setResourceTrust,
} from "@/lib/store";
import type { ResourceInput, TrustStatus } from "@/lib/types";
import { classifyResource } from "@/lib/classify-resource";
import { validateResourceUrl } from "@/lib/validate-resource";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isModerator(request: Request) {
  const token = process.env.MODERATION_TOKEN;
  if (!token) {
    return false;
  }
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${token}`;
}

export async function GET() {
  const resources = await listResources();
  return NextResponse.json({ resources });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const url = clean(body.url);

  if (!url) {
    return NextResponse.json(
      { error: "Pega un enlace para registrarlo." },
      { status: 400 },
    );
  }

  const validation = await validateResourceUrl(url);
  if (!validation.ok) {
    return NextResponse.json(
      {
        error:
          validation.reason ??
          "El sitio no pasó la validación automática y queda para revisión manual.",
      },
      { status: 422 },
    );
  }

  const classification = await classifyResource(validation);
  const input: ResourceInput = {
    name: classification.name,
    url,
    category: classification.category,
    summary: classification.summary,
    zone: classification.zone,
    contact: "",
    trustClaim: "community",
    evidence: `Clasificado por ${classification.source} con confianza ${classification.confidence}`,
    tags: classification.tags,
  };

  const result = await addResource(
    input,
    validation.normalizedUrl,
    validation.status,
    validation.responseMs,
  );

  return NextResponse.json({
    ok: true,
    duplicate: result.duplicate,
    resource: result.resource,
    message: result.duplicate
      ? "Este enlace ya estaba en el directorio."
      : `El sitio está operativo. La tarjeta fue creada como ${classification.category}.`,
  });
}

export async function DELETE(request: Request) {
  if (!isModerator(request)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = clean(url.searchParams.get("id"));
  if (!id) {
    return NextResponse.json(
      { error: "Falta el parámetro id." },
      { status: 400 },
    );
  }

  const removed = await deleteResource(id);
  if (!removed) {
    return NextResponse.json(
      { error: "No se encontró el recurso." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true, deleted: id });
}

export async function PATCH(request: Request) {
  if (!isModerator(request)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const id = clean(body?.id);
  const trust = clean(body?.trust) as TrustStatus;
  const allowed: TrustStatus[] = ["unofficial", "community", "verified"];

  if (!id || !allowed.includes(trust)) {
    return NextResponse.json(
      { error: "Envía id y trust (unofficial | community | verified)." },
      { status: 400 },
    );
  }

  const updated = await setResourceTrust(id, trust);
  if (!updated) {
    return NextResponse.json(
      { error: "No se encontró el recurso." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true, resource: updated });
}
