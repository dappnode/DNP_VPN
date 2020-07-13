const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/;

/**
 * Basic regex testing domains.
 * May reject valid domains, use with caution
 * From https://stackoverflow.com/questions/10306690/what-is-a-regular-expression-which-will-match-a-valid-domain-name-without-a-subd
 * @param domain
 */
export function isDomain(domain: string): boolean {
  return domainRegex.test(domain);
}
