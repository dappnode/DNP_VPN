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
exports.getUserList = void 0;
const shell_1 = require("../utils/shell");
// bash-4.4# ovpn_listclients
// name,begin,end,status
// dappnode_admin,Nov 21 14:00:04 2018 GMT,Nov 18 14:00:04 2028 GMT,VALID
// luser,Nov 23 14:00:49 2018 GMT,Nov 20 14:00:49 2028 GMT,VALID
// revoked,Nov 23 14:02:38 2018 GMT,Nov 20 14:02:38 2028 GMT,REVOKED
const ovpnListCommand = "/usr/local/bin/ovpn_listclients";
/**
 * Returns the list of current user ids
 * @returns ["dappnode_admin", "luser", "revoked"]
 */
function getUserList() {
    return __awaiter(this, void 0, void 0, function* () {
        const output = yield shell_1.shell(ovpnListCommand);
        const users = [];
        // Select users from first field.
        output
            .toString()
            .split("\n")
            .filter(line => !line.startsWith("name,"))
            .map(element => {
            if (element)
                users.push(element.split(",")[0]);
        });
        return users;
    });
}
exports.getUserList = getUserList;
//# sourceMappingURL=getUserList.js.map