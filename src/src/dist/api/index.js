"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startHttpApi = void 0;
const express_1 = __importDefault(require("express"));
const methods = __importStar(require("../calls"));
const getRpcHandler_1 = require("./getRpcHandler");
const logs_1 = require("../logs");
const utils_1 = require("./utils");
const auth_1 = require("./auth");
const clientConnect_1 = require("./clientConnect");
const params_1 = require("../params");
/**
 * HTTP API
 *
 * [NOTE] This API is not secure
 * - It can't use HTTPS for the limitations with internal IPs certificates
 */
function startHttpApi(port) {
    const app = express_1.default();
    // RPC
    const routesLogger = {
        onCall: (method, args) => logs_1.logs.debug(`RPC call ${method}`, args || []),
        onSuccess: (method, result) => logs_1.logs.debug(`RPC success ${method}`, result),
        onError: (method, e) => logs_1.logs.error(`RPC error ${method}`, e)
    };
    const rpcHandler = getRpcHandler_1.getRpcHandler(methods, routesLogger);
    app.use(express_1.default.json());
    // Ping / hello endpoint
    app.get("/", (_0, res) => res.send("VPN HTTP API"));
    // Rest of RPC methods
    app.post("/rpc", auth_1.isAdmin, utils_1.wrapHandler(rpcHandler));
    // OpenVPN hooks
    // Hook called by openvpn binary on each client connection
    app.post(params_1.CLIENT_CONNECT_PATHNAME, auth_1.isLocalhost, utils_1.wrapHandler(clientConnect_1.clientConnect));
    app.listen(port, () => logs_1.logs.info(`HTTP API started at ${port}`));
}
exports.startHttpApi = startHttpApi;
//# sourceMappingURL=index.js.map