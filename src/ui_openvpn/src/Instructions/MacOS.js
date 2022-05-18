import React from "react";
import okLogo from "../img/ok.png";

// MacOS -> Tunnelblick https://tunnelblick.net/

const MacOS = () => (
  <div>
    <h4>MacOS client</h4>
    <p className="jumotron-subtitle">
      Recommended client: <strong>Tunnelblick</strong>
      <img
        src={okLogo}
        className="main-logo"
        alt="ok"
        style={{ height: "18px", margin: "0px 0px 0px 7px" }}
      />
    </p>

    <a
      className="btn btn-primary dappnode-background-color"
      href="https://tunnelblick.net/"
    >
      INSTALL
    </a>
  </div>
);

export default MacOS;
