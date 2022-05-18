"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientConnect = void 0;
const credentials_1 = require("../credentials");
/**
 * Hook called by openvpn binary on each client connection
 * Must attach its entire environment as a JSON body
 */
exports.clientConnect = (req, res) => {
    const ovpnEnv = req.body;
    if (ovpnEnv.script_type !== "client-connect")
        throw Error("Only client-connect script allowed");
    if (!ovpnEnv.common_name)
        throw Error("No common_name provided");
    credentials_1.onDeviceConnected(ovpnEnv.common_name);
    res.send(`${ovpnEnv.common_name} connected`);
};
//# sourceMappingURL=clientConnect.js.map