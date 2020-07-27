import url from "url";
import { OPENVPN_CRED_PORT, CRED_URL_QUERY_PARAM } from "../params";

/**
 * Formats a URL to fetch a credentials file
 * http://${hostname}:${CRED_PORT}/?id=${idToken}#${secretKey}
 */
export function formatCredUrl({
  hostname,
  token,
  key
}: {
  hostname: string;
  token: string;
  key: string;
}): string {
  const search = new url.URLSearchParams();
  search.set(CRED_URL_QUERY_PARAM, token);
  return url.format({
    protocol: "http",
    hostname,
    port: OPENVPN_CRED_PORT,
    hash: encodeURIComponent(key),
    search: search.toString(),
    // Must have forward slash "/" at the end of the path
    // The end forward slash is necessary for Linux terminals to recognize
    // the entire URL as the same and be clickable
    pathname: "/"
  });
}
