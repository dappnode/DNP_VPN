import express from "express";
import * as methods from "../calls";
import { getRpcHandler } from "./getRpcHandler";
import { logs } from "../logs";
import { LoggerMiddleware } from "../types";
import { wrapHandler } from "./utils";
import { isAdmin, isLocalhost } from "./auth";
import { clientConnect } from "./clientConnect";
import { CLIENT_CONNECT_PATHNAME } from "../params";

/**
 * HTTP API
 *
 * [NOTE] This API is not secure
 * - It can't use HTTPS for the limitations with internal IPs certificates
 */
export function startHttpApi(port: number): void {
  const app = express();

  // RPC
  const routesLogger: LoggerMiddleware = {
    onCall: (method, args) => logs.debug(`RPC call ${method}`, args || []),
    onSuccess: (method, result) => logs.debug(`RPC success ${method}`, result),
    onError: (method, e) => logs.error(`RPC error ${method}`, e)
  };
  const rpcHandler = getRpcHandler(methods, routesLogger);

  app.use(express.json());

  // Ping / hello endpoint
  app.get("/", (_0, res) => res.send("VPN HTTP API"));

  // Rest of RPC methods
  app.post("/rpc", isAdmin, wrapHandler(rpcHandler));

  // OpenVPN hooks
  // Hook called by openvpn binary on each client connection
  app.post(CLIENT_CONNECT_PATHNAME, isLocalhost, wrapHandler(clientConnect));

  app.listen(port, () => logs.info(`HTTP API started at ${port}`));
}
