import { NextResponse } from "next/server";
import { addResource, listResources } from "@/lib/store";
import type { ResourceInput } from "@/lib/types";
import { classifyResource } from "@/lib/classify-resource";
import { validateResourceUrl } from "@/lib/validate-resource";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
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
