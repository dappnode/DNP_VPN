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
exports.listDevices = void 0;
const openvpn_1 = require("../openvpn");
/**
 * Returns a list of the existing devices, with the admin property
 */
function listDevices() {
    return __awaiter(this, void 0, void 0, function* () {
        const userList = yield openvpn_1.getUserList();
        return userList.map(user => ({
            id: user
        }));
    });
}
exports.listDevices = listDevices;
//# sourceMappingURL=listDevices.js.map