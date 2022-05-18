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
exports.removeDevice = void 0;
const openvpn_1 = require("../openvpn");
const params_1 = require("../params");
/**
 * Removes the device with the provided id, if exists.
 * @param id "new-device"
 */
function removeDevice({ id }) {
    return __awaiter(this, void 0, void 0, function* () {
        const deviceArray = yield openvpn_1.getUserList();
        if (id === params_1.MAIN_ADMIN_NAME) {
            throw Error("Cannot remove the main admin user");
        }
        if (!deviceArray.includes(id)) {
            throw Error(`Device name not found: ${id}`);
        }
        else {
            yield openvpn_1.removeClient(id);
        }
    });
}
exports.removeDevice = removeDevice;
//# sourceMappingURL=removeDevice.js.map