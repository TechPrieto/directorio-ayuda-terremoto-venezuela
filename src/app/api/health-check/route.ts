import { NextResponse } from "next/server";
import { listResources, updateResourceHealth } from "@/lib/store";
import { validateResourceUrl } from "@/lib/validate-resource";

export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }
  }

  const resources = await listResources();
  const checked = [];

  for (const resource of resources) {
    const validation = await validateResourceUrl(resource.url);
    const updated = await updateResourceHealth(
      resource,
      validation.status,
      validation.responseMs,
      validation.reason,
    );
    checked.push({
      id: updated.id,
      status: updated.status,
      responseMs: updated.responseMs,
      failureReason: updated.failureReason,
    });
  }

  return NextResponse.json({ ok: true, checked });
}
