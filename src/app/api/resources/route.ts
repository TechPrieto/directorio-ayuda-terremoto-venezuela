import { NextResponse } from "next/server";
import { addResource, listResources } from "@/lib/store";
import type { ResourceInput } from "@/lib/types";
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

  const input: ResourceInput = {
    name: clean(body.name),
    url: clean(body.url),
    category: clean(body.category),
    summary: clean(body.summary),
    zone: clean(body.zone) || "Venezuela",
    contact: clean(body.contact),
    trustClaim: clean(body.trustClaim) || "community",
    evidence: clean(body.evidence),
  };

  if (!input.name || !input.url || !input.category || input.summary.length < 12) {
    return NextResponse.json(
      { error: "Faltan campos obligatorios o la descripción es muy corta." },
      { status: 400 },
    );
  }

  const validation = await validateResourceUrl(input.url);
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
      : "El sitio está operativo. La tarjeta fue creada como No oficial + Operativo.",
  });
}
