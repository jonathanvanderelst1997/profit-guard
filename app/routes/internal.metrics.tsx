import type { LoaderFunctionArgs } from "react-router";
import { getLaunchMetrics } from "../lib/analytics.server";

function requestToken(request: Request): string | null {
  const url = new URL(request.url);
  const bearer = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  return bearer ?? url.searchParams.get("token");
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const expectedToken = process.env.METRICS_TOKEN;
  if (!expectedToken) {
    return Response.json({ ok: false, error: "METRICS_TOKEN is not configured." }, { status: 503 });
  }

  if (requestToken(request) !== expectedToken) {
    return Response.json({ ok: false, error: "Forbidden." }, { status: 403 });
  }

  const url = new URL(request.url);
  const days = Number(url.searchParams.get("days") ?? 30);
  return Response.json(await getLaunchMetrics(days));
};
