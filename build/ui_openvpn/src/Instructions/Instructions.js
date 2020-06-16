import React from "react";
import okLogo from "../img/ok.png";

// MacOS -> Tunnelblick https://tunnelblick.net/

const Instructions = ({ name, client = {} }) => (
  <div>
    <h4>{name} client</h4>
    <p className="jumotron-subtitle">
      Recommended client: <strong>{client.name}</strong>
      <img
        src={okLogo}
        className="main-logo"
        alt="ok"
        style={{ height: "18px", margin: "0px 0px 0px 7px" }}
      />
    </p>

    <div className="mt-3">
      <a
        className="btn btn-primary dappnode-background-color"
        href={client.url}
      >
        INSTALL
      </a>
    </div>

    <div>
      <img
        src={client.banner}
        alt="banner img"
        style={{
          width: "100%",
          margin: "15px 0px"
        }}
      />
    </div>
  </div>
);

export default Instructions;
