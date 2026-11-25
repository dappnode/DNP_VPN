import "mocha";
import { expect } from "chai";

import { shell, ShellError } from "../../src/utils/shell";

describe("utils > shell", () => {
  it("passes arguments verbatim without shell interpretation", async () => {
    const arg = "a; echo pwned $(id) `id` | cat > /dev/null";
    const out = await shell("printf", ["%s", arg]);
    expect(out).to.equal(arg);
  });

  it("rejects with a ShellError on non-zero exit", async () => {
    let error: unknown;
    try {
      await shell("sh", ["-c", "echo boom >&2; exit 3"]);
    } catch (e) {
      error = e;
    }
    expect(error).to.be.instanceOf(ShellError);
    expect((error as ShellError).code).to.equal(3);
    expect((error as ShellError).stderr).to.contain("boom");
  });
});
