import fs from "fs";
import path from "path";
import { logs } from "./logs";
import { OPENVPN } from "./params";

export function createVarsFileIfNotExist(): void {
  try {
    // Get the environment variables
    const easyrsaVarsFile = path.join(OPENVPN, "vars");
    const varsExamplePath = "/usr/share/easy-rsa/vars.example";

    // Check if the EASYRSA_VARS_FILE exists
    if (!fs.existsSync(easyrsaVarsFile)) {
      // Copy vars.example if it exists, else create an empty vars file
      if (fs.existsSync(varsExamplePath))
        fs.copyFileSync(varsExamplePath, easyrsaVarsFile);
      else fs.writeFileSync(easyrsaVarsFile, "");
    }
  } catch (e) {
    logs.error("Error creating vars file", e);
  }
}
