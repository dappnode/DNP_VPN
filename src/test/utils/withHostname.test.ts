import "mocha";
import { expect } from "chai";

import { withHostname } from "../../src/utils/withHostname";

describe("utils > withHostname", () => {
  it("Should replace hostname preserving port, path, query, and hash", () => {
    const inputUrl =
      "http://9442df98a3a59a65.dyndns.dappnode.io:8092/?id=xkmTGRv3sdu9XUuz#0P%2Blna33F5loAIUx13fgm3F7%2FRLFFvOigZDt9h2kcp8%3D";

    const outputUrl = withHostname(inputUrl, "localhost");

    expect(outputUrl).to.equal(
      "http://localhost:8092/?id=xkmTGRv3sdu9XUuz#0P%2Blna33F5loAIUx13fgm3F7%2FRLFFvOigZDt9h2kcp8%3D"
    );
  });

  it("Should return the raw input if it is not a valid URL", () => {
    const inputUrl = "not-a-url";
    expect(withHostname(inputUrl, "localhost")).to.equal(inputUrl);
  });
});
