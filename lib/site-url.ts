export function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.NODE_ENV !== "production"
          ? "http://localhost:3000"
          : null);

  if (!configuredUrl) {
    throw new Error("Set NEXT_PUBLIC_SITE_URL to the public site URL.");
  }

  let url: URL;
  try {
    url = new URL(configuredUrl);
  } catch {
    throw new Error("NEXT_PUBLIC_SITE_URL must be a valid absolute URL.");
  }
  if (url.protocol !== "https:" && url.hostname !== "localhost") {
    throw new Error("NEXT_PUBLIC_SITE_URL must use HTTPS outside local development.");
  }

  return url.origin;
}
