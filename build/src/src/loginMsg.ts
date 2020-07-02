import fs from "fs";
import { renderQrCode } from "./utils/renderQrCode";
import { GLOBAL_ENVS } from "./params";

// necessary for cleaning in testing
export const loginMsgPath = process.env.LOGIN_MSG_PATH || "./loginMsgFile.txt";

export async function generateAndWriteLoginMsg(url: string): Promise<string> {
  const loginMsg = await generateLoginMsg(url);
  fs.writeFileSync(loginMsgPath, loginMsg, "utf8");
  return loginMsg; // return for testing
}

export async function generateLoginMsg(url: string): Promise<string> {
  let msg = "\n\n";

  // Show the QR code
  // Wraps qrcode library's callback style into a promise
  if (!url) throw Error("generateLoginMsg: url is empty or not defined");
  msg += await renderQrCode(url);

  // Show credentials

  msg += `\n To connect to your DAppNode scan the QR above or copy/paste link below into your browser:
  ${url}\n`;

  if (
    process.env[GLOBAL_ENVS.UPNP_AVAILABLE] &&
    (process.env[GLOBAL_ENVS.UPNP_AVAILABLE] || "").trim() == "false"
  ) {
    msg += `\n ALERT: You may not be able to connect. Turn your router's UPnP on or open the VPN port (1194/udp) manually`;
  }
  if (
    process.env[GLOBAL_ENVS.NO_NAT_LOOPBACK] &&
    (process.env[GLOBAL_ENVS.NO_NAT_LOOPBACK] || "").trim() == "false"
  ) {
    msg += `\n ALERT: NAT-Loopback is disabled. If you are connecting from the same network as your DAppNode use the internal IP: ${
      process.env[GLOBAL_ENVS.INTERNAL_IP]
    }`;
  }

  return msg;
}
