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
exports.buildClient = void 0;
const shell_1 = require("../utils/shell");
/**
 * @param id "new-device"
 */
function buildClient(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield shell_1.shell(`easyrsa build-client-full ${id} nopass`);
        }
        catch (err) {
            throw Error(`Error building client: ${err.message}`);
        }
    });
}
exports.buildClient = buildClient;
//# sourceMappingURL=buildClient.js.map