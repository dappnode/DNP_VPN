import "mocha";
import { expect } from "chai";

import { isDomain } from "../../src/utils/domain";

describe("utils > domain", () => {
  const cases: { domain: string; is: boolean }[] = [
    { domain: "b6fa35f6c459f902.dyndns.dappnode.io", is: true },
    { domain: "173.249.50.221", is: true },
    { domain: "404", is: false },
    { domain: "Connection rejected", is: false },
    {
      domain: `<!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="utf-8" />`,
      is: false
    }
  ];

  for (const { domain, is } of cases) {
    it(`isDomain ${domain} = ${is}`, () => {
      expect(isDomain(domain)).to.equal(is);
    });
  }
});
