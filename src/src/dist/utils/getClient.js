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
exports.getClient = void 0;
const shell_1 = require("../utils/shell");
const fetchCredsCommand = "/usr/local/bin/ovpn_getclient";
/**
 * Returns the .ovpn file of an existing client in plain text
 * @param id "new-device"
 */
function getClient(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield shell_1.shell(`${fetchCredsCommand} ${id}`);
        }
        catch (err) {
            throw Error(`Error retrieving client ${id}: ${err.message}`);
        }
    });
}
exports.getClient = getClient;
//# sourceMappingURL=getClient.js.map