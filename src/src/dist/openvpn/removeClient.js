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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeClient = void 0;
const fs_1 = __importDefault(require("fs"));
const credentials_1 = require("../credentials");
const shell_1 = require("../utils/shell");
const revokeCommand = "/usr/local/bin/ovpn_revokeclient";
/**
 * @param id "new-device"
 */
function removeClient(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Revoke first to save in CRL
            yield shell_1.shell(`${revokeCommand} ${id}`);
            for (const file of [
                `${process.env.OPENVPN}/pki/private/${id}.key`,
                `${process.env.OPENVPN}/pki/reqs/${id}.req`,
                `${process.env.OPENVPN}/pki/issued/${id}.crt`
            ])
                fs_1.default.unlinkSync(file);
            credentials_1.deleteTokenForId(id);
        }
        catch (err) {
            throw Error(`Error removing device ${id}: ${err.message}`);
        }
    });
}
exports.removeClient = removeClient;
//# sourceMappingURL=removeClient.js.map