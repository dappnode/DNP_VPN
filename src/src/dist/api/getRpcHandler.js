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
exports.getRpcHandler = void 0;
/**
 * Given a set of method handlers, parse a RPC request and handle it
 * @param methods
 * @param loggerMiddleware
 */
exports.getRpcHandler = (methods, loggerMiddleware) => {
    const { onCall, onSuccess, onError } = loggerMiddleware || {};
    return (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const body = req.body;
        try {
            const { method, params } = parseRpcRequest(body);
            // Get handler
            const handler = methods[method];
            if (!handler)
                throw new JsonRpcReqError(`Method not found ${method}`);
            if (onCall)
                onCall(method, params);
            const result = yield handler(...params);
            if (onSuccess)
                onSuccess(method, result, params);
            res.send({ result });
        }
        catch (e) {
            if (e instanceof JsonRpcReqError) {
                // JSON RPC request formating errors, do not log
                res.send({ error: { code: e.code, message: e.message } });
            }
            else {
                // Unexpected error, log and send more details
                const { method, params } = tryToParseRpcRequest(body);
                if (onError)
                    onError(method || "unknown-method", e, params || []);
                res.send({ error: { message: e.message, data: e.stack } });
            }
        }
    });
};
/**
 * Parse RPC request, to be used in the server
 * @param body
 */
function parseRpcRequest(body) {
    if (typeof body !== "object")
        throw Error(`body request must be an object, ${typeof body}`);
    const { method, params } = body;
    if (!method)
        throw new JsonRpcReqError("request body missing method");
    if (!params)
        throw new JsonRpcReqError("request body missing params");
    if (!Array.isArray(params))
        throw new JsonRpcReqError("request body params must be an array");
    return {
        method: method,
        params
    };
}
function tryToParseRpcRequest(body) {
    try {
        return parseRpcRequest(body);
    }
    catch (_a) {
        return {};
    }
}
/**
 * Errors specific to JSON RPC request payload formating
 */
class JsonRpcReqError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code || -32603;
    }
}
//# sourceMappingURL=getRpcHandler.js.map