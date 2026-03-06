import React, { Component } from "react";
// import { Route, NavLink as Link } from "react-router-dom";
import saveAs from "file-saver";
// General components
import HiddenRedirector from "./HiddenRedirector";
// Platform dedicated components
// import Instructions from "./Instructions/Instructions";
import MacOS from "./Instructions/MacOS";
import Windows from "./Instructions/Windows";
import Android from "./Instructions/Android";
import iOS from "./Instructions/iOS";
import Linux from "./Instructions/Linux";
import Chromebook from "./Instructions/Chromebook";
// Utils
import getParamsFromUrl from "./utils/getParamsFromUrl";
import isBase64 from "./utils/isBase64";
import decrypt from "./utils/decrypt";
import getServerName from "./utils/getServerName";
// Logos
import errorLogo from "./img/error.png";
import okLogo from "./img/ok.png";
import logo from "./img/dappnode-logo.png";
// Icons
import FaAndroid from "./icons/FaAndroid";
import FaApple from "./icons/FaApple";
import FaChrome from "./icons/FaChrome";
import FaLinux from "./icons/FaLinux";
import FaMobile from "./icons/FaMobile";
import FaWindows from "./icons/FaWindows";

window.saveAs = saveAs;

const dappnodeVpnDocsUrl =
  "https://docs.dappnode.io/docs/user/access-your-dappnode/vpn/openvpn";

const adminUiUrl = "http://my.dappnode/";

const options = [
  {
    name: "MacOS",
    route: "macos",
    component: MacOS,
    icon: FaApple,
    link: `https://openvpn.net/client/`,
  },
  {
    name: "iOS",
    route: "ios",
    component: iOS,
    icon: FaMobile,
    link: `https://apps.apple.com/us/app/openvpn-connect/id590379981`,
  },
  {
    name: "Windows",
    route: "windows",
    component: Windows,
    icon: FaWindows,
    link: `https://openvpn.net/client/`,
  },
  {
    name: "Android",
    route: "android",
    component: Android,
    icon: FaAndroid,
    link: `https://play.google.com/store/apps/details?id=net.openvpn.openvpn`,
  },
  {
    name: "Linux",
    route: "linux",
    component: Linux,
    icon: FaLinux,
    link: `https://openvpn.net/community-docs/openvpn-client-for-linux.html`,
  },
  {
    name: "Chromebook",
    route: "chromebook",
    component: Chromebook,
    icon: FaChrome,
    link: `https://play.google.com/store/apps/details?id=net.openvpn.openvpn`,
  },
];

const ovpnType = "application/x-openvpn-profile";
const fileExtension = "ovpn";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: null,
      file: null,
    };
  }

  async componentDidMount() {
    try {
      // 1. Get params from url
      this.setState({ loading: true });
      const { key, id, name, dev } = getParamsFromUrl();
      // Construct url to request cred file with common ENVs on the webserver
      const urlObj = new URL(window.location.origin);
      urlObj.pathname = process.env.REACT_APP_CRED_URL_PATHNAME;
      urlObj.searchParams.set(process.env.REACT_APP_CRED_URL_QUERY_PARAM, id);
      const url = urlObj.toString();

      // Dev param to be able to work on the UI
      if (dev) {
        if (dev === "loading") this.setState({ loading: true });
        if (dev === "success") this.setState({ loading: false, file: "file" });
        if (dev === "error") this.setState({ loading: false, error: "error" });
        return console.warn(`dev parameter set, dev: ${dev}`);
      }

      // 2. Fetch file from server
      const res = await fetch(url);
      if (res.status === 404)
        throw Error("Link expired, contact your Dappnode administrator");
      if (!res.ok)
        throw Error(`Error fetching your credentials file: ${res.statusText}`);
      const encryptedFile = await res.text();

      // 3. Decrypt
      if (!isBase64(encryptedFile)) {
        const filePreview = (encryptedFile || "").substring(0, 100);
        throw Error(
          `Incorrect ID or wrong file format (no-base64). url: ${url} encryptedFile: ${filePreview}...\n`,
        );
      }
      const file = decrypt(encryptedFile, key);
      this.setState({ loading: false, file, name });
    } catch (err) {
      this.setState({
        loading: false,
        error: err.message || "Unknown error",
      });
      console.error("Error resolving request", err);
    }
  }

  render() {
    const { file, name, error, loading } = this.state;
    const blob = new Blob([file], { type: ovpnType });
    const filename = `${getServerName(name)}.${fileExtension}`;

    if (error) {
      return (
        <div className="status-panel card-surface">
          <img src={errorLogo} className="main-logo" alt="error" />
          <h6 className="main-text">{error}</h6>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="status-panel card-surface">
          <div className="loading-spinner"></div>
          <h6 className="main-text">Loading...</h6>
        </div>
      );
    }

    if (file) {
      return (
        <React.Fragment>
          <div className="hero-section">
            <div className="card-surface">
              <h2 className="hero-title">
                Set up your Dappnode OpenVPN connection
              </h2>
              <p className="hero-subtitle">
                Download the .ovpn file provided by your Dappnode administrator
                and import it to your client. You can follow the guides below on
                how to import an .ovpn file.
              </p>

              <div className="hero-actions">
                <div className="status-pill">
                  <img src={okLogo} className="status-icon" alt="ok" />
                  <span>Successfully decrypted</span>
                </div>
                <button
                  className="btn btn-primary dappnode-background-color"
                  onClick={saveAs.bind(this, blob, filename)}
                >
                  Download .ovpn
                </button>
              </div>

              <div className="hero-footer">
                <p>After connecting to the VPN, access your Dappnode</p>
                <a
                  className="btn btn-primary dappnode-background-color"
                  href={adminUiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Go to my.dappnode
                </a>
              </div>
            </div>
          </div>

          <div className="section-divider">
            <div className="container">
              <h2>Haven't installed an OpenVPN client already?</h2>
              <p>Choose your OS below</p>
            </div>
          </div>

          <div className="container instructions-section">
            <div className="instructions-row">
              {options.map((option, i) => (
                <div key={i} className="instructions-card">
                  <a
                    className="instructions-link"
                    href={option.link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="nav-icon">
                      <option.icon />
                    </div>
                    <div className="nav-text">{option.name}</div>
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="help-section">
            <div className="container">
              <p>
                Having trouble?{" "}
                <a
                  className="dappnode-color"
                  href={dappnodeVpnDocsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Check out the full documentation
                </a>
              </p>
            </div>
          </div>

          <HiddenRedirector />
        </React.Fragment>
      );
    }

    return (
      <div className="status-panel card-surface">
        <img src={logo} className="main-logo" alt="logo" />
        <h6 className="main-text">¯\_(ツ)_/¯</h6>
      </div>
    );
  }
}
