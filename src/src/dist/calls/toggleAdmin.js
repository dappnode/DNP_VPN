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
exports.toggleAdmin = void 0;
const openvpn_1 = require("../openvpn");
const params_1 = require("../params");
/**
 * Gives/removes admin rights to the provided device id.
 * @param id "new-device"
 */
function toggleAdmin({ id }) {
    return __awaiter(this, void 0, void 0, function* () {
        const devices = yield openvpn_1.getUserList();
        if (!devices.includes(id)) {
            throw Error(`Device not found: ${id}`);
        }
        const ccdArray = openvpn_1.getCCD();
        const isAdmin = ccdArray.find(c => c.cn === id);
        if (isAdmin) {
            if (id === params_1.MAIN_ADMIN_NAME) {
                throw Error("Cannot revoke the main admin user");
            }
            openvpn_1.revokeAdmin(id);
        }
        else {
            openvpn_1.grantAdmin(id);
        }
    });
}
exports.toggleAdmin = toggleAdmin;
//# sourceMappingURL=toggleAdmin.js.map