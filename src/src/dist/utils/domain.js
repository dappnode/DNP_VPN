"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDomain = void 0;
const domainRegex = /[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+/;
/**
 * Basic regex testing domains.
 * May reject valid domains, use with caution
 * From https://stackoverflow.com/questions/10306690/what-is-a-regular-expression-which-will-match-a-valid-domain-name-without-a-subd
 * @param domain
 */
function isDomain(domain) {
    return domainRegex.test(domain);
}
exports.isDomain = isDomain;
//# sourceMappingURL=domain.js.map