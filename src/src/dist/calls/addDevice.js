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
exports.addDevice = void 0;
const openvpn_1 = require("../openvpn");
const params_1 = require("../params");
/**
 * Creates a new device with the provided id.
 * Generates certificates and keys needed for OpenVPN.
 * @param id "new-device"
 */
function addDevice({ id }) {
    return __awaiter(this, void 0, void 0, function* () {
        if (id === "")
            throw Error("The new device name cannot be empty");
        if ((id || "").toLowerCase() === "guests" ||
            (id || "").toLowerCase() === "guest")
            throw Error(`Please use the enable guests function to create a "Guest(s)" user`);
        const userArray = yield openvpn_1.getUserList();
        if (userArray.length >= params_1.USER_LIMIT)
            throw Error(`You have reached the max user limit: ${params_1.USER_LIMIT}`);
        if (!userArray.includes(id)) {
            yield openvpn_1.buildClient(id);
        }
        else {
            throw Error(`Device name exists: ${id}`);
        }
    });
}
exports.addDevice = addDevice;
//# sourceMappingURL=addDevice.js.map