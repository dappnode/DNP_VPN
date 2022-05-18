"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeviceCredentials = void 0;
const openvpn_1 = require("../openvpn");
const credentials_1 = require("../credentials");
/**
 * Returns a URL browsable from outside the DAppNode network
 * The URL contains necessary credentials (token + encryption key) to retrieve
 * and download an OpenVPN credentials file for the device `id`
 * @param id "new-device"
 */
function getDeviceCredentials({ id }) {
    return __awaiter(this, void 0, void 0, function* () {
        // Make sure the client exists
        yield openvpn_1.getClient(id);
        return { url: credentials_1.getConnectUrl(id) };
    });
}
exports.getDeviceCredentials = getDeviceCredentials;
//# sourceMappingURL=getDeviceCredentials.js.map