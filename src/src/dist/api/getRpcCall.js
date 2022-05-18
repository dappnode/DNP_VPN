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
exports.getRpcCall = void 0;
const got_1 = __importDefault(require("got"));
const routes_1 = require("../api/routes");
const lodash_1 = require("lodash");
function getRpcCall(vpnApiRpcUrl) {
    return lodash_1.mapValues(routes_1.routesData, (_0, route) => {
        return function (...args) {
            return __awaiter(this, void 0, void 0, function* () {
                const body = yield got_1.default
                    .post(vpnApiRpcUrl, { json: { method: route, params: args } })
                    .json();
                // RPC response are always code 200
                return parseRpcResponse(body);
            });
        };
    });
}
exports.getRpcCall = getRpcCall;
/**
 * Parse RPC response, to be used in the client
 * RPC response must always have code 200
 * @param body
 */
function parseRpcResponse(body) {
    return __awaiter(this, void 0, void 0, function* () {
        if (body.error) {
            const error = new JsonRpcResError(body.error);
            if (typeof body.error.data === "string") {
                // If data is of type string assume it's the error stack
                error.stack = body.error.data + "\n" + error.stack || "";
            }
            throw error;
        }
        else {
            return body.result;
        }
    });
}
/**
 * Wrap JSON RPC response errors
 */
class JsonRpcResError extends Error {
    constructor(jsonRpcError) {
        super((jsonRpcError || {}).message);
        this.code = (jsonRpcError || {}).code || -32603;
        this.data = (jsonRpcError || {}).data;
    }
}
//# sourceMappingURL=getRpcCall.js.map