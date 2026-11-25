/**
 * Thin wrapper over the global fetch that
 * - rejects on non 2xx responses (as `got` did with `throwHttpErrors`)
 * - surfaces the underlying network error ("connect ECONNREFUSED ...")
 *   instead of the generic "fetch failed"
 */
export async function fetchText(
  url: string,
  init?: RequestInit
): Promise<string> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (e) {
    const cause = (e as { cause?: { code?: string; message?: string } }).cause;
    if (cause?.message)
      throw Error([cause.code, cause.message].filter(Boolean).join(" "), {
        cause: e
      });
    throw e;
  }

  const body = await res.text();
  if (!res.ok) throw new HttpStatusError(res.status, res.statusText, url, body);
  return body;
}

export class HttpStatusError extends Error {
  status: number;
  body: string;
  constructor(status: number, statusText: string, url: string, body: string) {
    super(`Response code ${status} (${statusText}) from ${url}`);
    this.status = status;
    this.body = body;
  }
}
