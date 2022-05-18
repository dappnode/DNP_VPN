import "mocha";
import { expect } from "chai";

import { getRandomToken } from "../../src/utils/crypto";

describe("utils > crypto", () => {
  describe("getRandomToken", () => {
    it("Should create a random token with base64 expect special characters", () => {
      const length = 16;
      const token = getRandomToken(length);
      expect(token).to.be.length(length, "Wrong length");
      for (const char of ["+", "/", "="]) {
        expect(token).to.not.contain(char, `Must not include ${char}`);
      }
    });
  });
});
