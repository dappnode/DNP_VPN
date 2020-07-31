import "mocha";
import { expect } from "chai";

import { formatCredUrl } from "../../src/credentials/formatCredUrl";

describe("credentials > formatCredUrl", () => {
  it("Should format a cred URL correctly (with end slash)", () => {
    // Must have forward slash "/" at the end of the path
    // "/" is necessary for Linux terminals to make the entire URL clickable
    // NO http://3aac75e4d80656b1.dyndns.dappnode.io:8092?id=5e4ccdf9886defb40f991ab1f9883f888a6477a275d33b2023943dda77eb24e7#4BLBLLd7GCWOXA0mK0s9EWmbHksOq8MMQ5RzW9dxlVk%3D"
    // YES http://3aac75e4d80656b1.dyndns.dappnode.io:8092/?id=5e4ccdf9886defb40f991ab1f9883f888a6477a275d33b2023943dda77eb24e7#4BLBLLd7GCWOXA0mK0s9EWmbHksOq8MMQ5RzW9dxlVk%3D"
    const url = formatCredUrl({
      hostname: "3aac75e4d80656b1.dyndns.dappnode.io",
      token: "5e4ccdf9886defb40f991ab1f9883f888a6477a275d33b2023943dda77eb24e7",
      key: "4BLBLLd7GCWOXA0mK0s9EWmbHksOq8MMQ5RzW9dxlVk="
    });

    expect(url).to.equal(
      "http://3aac75e4d80656b1.dyndns.dappnode.io:8092/?id=5e4ccdf9886defb40f991ab1f9883f888a6477a275d33b2023943dda77eb24e7#4BLBLLd7GCWOXA0mK0s9EWmbHksOq8MMQ5RzW9dxlVk%3D"
    );
  });
});
