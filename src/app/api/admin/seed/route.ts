import { NextResponse } from "next/server";
import { seedResources } from "@/lib/seed-resources";
import { addResource } from "@/lib/store";
import type { ResourceInput } from "@/lib/types";

export const maxDuration = 60;

export async function POST(request: Request) {
  const token = process.env.ADMIN_SEED_TOKEN;
  const auth = request.headers.get("authorization");

  if (!token || auth !== `Bearer ${token}`) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const results = [];

  for (const resource of seedResources) {
    const input: ResourceInput = {
      name: resource.name,
      url: resource.url,
      category: resource.category,
      summary: resource.summary,
      zone: resource.zone,
      contact: "",
      trustClaim: "community",
      evidence: "Seed inicial curado",
      tags: resource.tags,
    };

    const result = await addResource(
      input,
      resource.url,
      resource.status,
      resource.responseMs,
    );
    results.push({
      id: result.resource.id,
      duplicate: result.duplicate,
    });
  }

  return NextResponse.json({
    ok: true,
    inserted: results.filter((result) => !result.duplicate).length,
    duplicates: results.filter((result) => result.duplicate).length,
    results,
  });
}
