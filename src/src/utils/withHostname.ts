export function withHostname(rawUrl: string, hostname: string): string {
  try {
    const parsed = new URL(rawUrl);
    parsed.hostname = hostname;
    return parsed.toString();
  } catch (e) {
    return rawUrl;
  }
}
