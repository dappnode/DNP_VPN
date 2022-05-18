"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openvpnBinary = void 0;
const supervisor_1 = require("../utils/supervisor");
const logs_1 = require("../logs");
exports.openvpnBinary = supervisor_1.Supervisor("/usr/local/bin/ovpn_run", [], {
    log: data => logs_1.logs.info("[OVPN]", data)
});
//# sourceMappingURL=openvpnBinary.js.map