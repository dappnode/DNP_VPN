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
exports.createMasterAdminUser = void 0;
const calls_1 = require("./calls");
const openvpn_1 = require("./openvpn");
const params_1 = require("./params");
const loginMsg_1 = require("./loginMsg");
function createMasterAdminUser() {
    return __awaiter(this, void 0, void 0, function* () {
        const devices = yield calls_1.listDevices();
        if (!devices.some(device => device.id === params_1.MASTER_ADMIN_NAME)) {
            // Create admin user
            yield calls_1.addDevice({ id: params_1.MASTER_ADMIN_NAME });
            openvpn_1.grantAdmin(params_1.MASTER_ADMIN_NAME);
            // Print login message for user to connect
            const { url } = yield calls_1.getDeviceCredentials({ id: params_1.MASTER_ADMIN_NAME });
            const loginMsg = yield loginMsg_1.generateAndWriteLoginMsg(url);
            console.log(loginMsg);
        }
    });
}
exports.createMasterAdminUser = createMasterAdminUser;
//# sourceMappingURL=createMasterAdminUser.js.map