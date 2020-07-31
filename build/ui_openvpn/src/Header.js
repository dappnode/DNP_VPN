import React, { Component } from "react";
import dappnodeLogo from "./img/logo.png";

class Header extends Component {
  render() {
    return (
      <nav className="navbar navbar-dark bg-dark">
        <div className="container">
          <div className="row">
            <span className="navbar-brand">
              <img
                src={dappnodeLogo}
                className="navbar-logo"
                alt="DAppNode logo"
              />
              <span className="header-brand">DAppNode </span>
              <span className="header-vertical-bar" />
              <span className="header-sub-brand dappnode-color">
                Connection Setup
              </span>
            </span>
          </div>
        </div>
      </nav>
    );
  }
}

export default Header;
