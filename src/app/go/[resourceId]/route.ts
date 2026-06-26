import { NextResponse } from "next/server";
import { getResource, recordClick } from "@/lib/store";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ resourceId: string }> },
) {
  const { resourceId } = await params;
  const resource = await getResource(resourceId);

  if (!resource) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  await recordClick(resource, request);
  return NextResponse.redirect(resource.url, 302);
}
