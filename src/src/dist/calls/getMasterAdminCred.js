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
exports.getMasterAdminCred = void 0;
const addDevice_1 = require("./addDevice");
const params_1 = require("../params");
const logs_1 = require("../logs");
const getDeviceCredentials_1 = require("./getDeviceCredentials");
const listDevices_1 = require("./listDevices");
/**
 * Ensures the MASTER_ADMIN device is created
 * Returns a URL browsable from outside the DAppNode network
 * The URL contains necessary credentials (token + encryption key) to retrieve
 * and download an OpenVPN credentials file for the MASTER_ADMIN device
 */
function getMasterAdminCred() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const devices = yield listDevices_1.listDevices();
            if (devices.find(d => d.id === params_1.MAIN_ADMIN_NAME)) {
                logs_1.logs.info(`User ${params_1.MAIN_ADMIN_NAME} already exists`);
            }
            else {
                yield addDevice_1.addDevice({ id: params_1.MAIN_ADMIN_NAME });
            }
        }
        catch (e) {
            if (!e.message.includes("exist"))
                logs_1.logs.error(`Error creating ${params_1.MAIN_ADMIN_NAME} device`, e);
        }
        return yield getDeviceCredentials_1.getDeviceCredentials({ id: params_1.MAIN_ADMIN_NAME });
    });
}
exports.getMasterAdminCred = getMasterAdminCred;
//# sourceMappingURL=getMasterAdminCred.js.map