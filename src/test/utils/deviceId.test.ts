import "mocha";
import { expect } from "chai";

import { assertValidDeviceId } from "../../src/utils/deviceId";

describe("utils > deviceId", () => {
  const valid = ["dappnode_admin", "my-phone", "Jordi", "laptop.2", "José"];
  const invalid = [
    "",
    ".",
    "..",
    "../../etc/passwd",
    "a/b",
    "a\\b",
    "-rf",
    "--help",
    "my phone",
    "x\ny",
    "x\0y",
    "a;b c"
  ];

  for (const id of valid) {
    it(`accepts ${JSON.stringify(id)}`, () => {
      expect(() => assertValidDeviceId(id)).to.not.throw();
    });
  }

  for (const id of invalid) {
    it(`rejects ${JSON.stringify(id)}`, () => {
      expect(() => assertValidDeviceId(id)).to.throw();
    });
  }

  it("rejects non-string ids", () => {
    expect(() => assertValidDeviceId(undefined)).to.throw();
    expect(() => assertValidDeviceId({ id: "a" })).to.throw();
  });
});
