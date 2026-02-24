import React, { Component } from "react";
import dappnodeLogo from "./img/logo.png";

class Header extends Component {
  render() {
    return (
      <nav className="navbar">
        <div className="container">
          <span className="navbar-brand">
            <img
              src={dappnodeLogo}
              className="navbar-logo"
              alt="DAppNode logo"
            />
            <span className="header-brand">Dappnode</span>
            <span className="header-pill">OpenVPN</span>
          </span>
        </div>
      </nav>
    );
  }
}

export default Header;
