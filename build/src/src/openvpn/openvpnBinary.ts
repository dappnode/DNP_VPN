import { Supervisor } from "../utils/supervisor";
import { logs } from "../logs";

export const openvpnBinary = Supervisor("/usr/local/bin/ovpn_run", [], {
  log: data => logs.info("[OVPN]", data)
});
