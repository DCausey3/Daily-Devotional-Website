import { unsubscribeSubscriber } from "@/lib/subscriber-preferences";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.startsWith("application/x-www-form-urlencoded")) {
    return new Response("Unsupported content type.", { status: 415 });
  }

  const formData = await request.formData();
  if (formData.get("List-Unsubscribe") !== "One-Click") {
    return new Response("Invalid unsubscribe request.", { status: 400 });
  }

  const token = new URL(request.url).searchParams.get("token") ?? "";
  const subscriber = await unsubscribeSubscriber(token, "email");
  if (!subscriber) return new Response("Invalid unsubscribe link.", { status: 404 });

  return new Response(null, { status: 204 });
}
