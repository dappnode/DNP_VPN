import React, { Component } from "react";
import { Route } from "react-router-dom";
import parser from "ua-parser-js";

export default () => (
  <Route path="/" render={props => <Redirector {...props} />} />
);

class Redirector extends Component {
  componentWillMount() {
    const platform = guessUserPlatform();
    if (platform) {
      this.props.history.push(platform + this.props.location.hash);
    } else {
      this.props.history.push("credentials" + this.props.location.hash);
    }
  }

  render() {
    return null;
  }
}

function guessUserPlatform() {
  // UA reference: https://deviceatlas.com/blog/list-of-user-agent-strings
  // More extensive UA reference https://developers.whatismybrowser.com/useragents/explore/

  const ua = parser(navigator.userAgent);
  const osName = ua.os.name.toLowerCase();

  if (osName.includes("android")) {
    return "android";
  } else if (osName.includes("ios") || osName.includes("iphone")) {
    return "ios";
  } else if (osName.includes("mac os") || osName.includes("macos")) {
    return "macos";
  } else if (osName.includes("windows")) {
    return "windows";
  } else if (osName.includes("linux")) {
    return "linux";
  }
}
