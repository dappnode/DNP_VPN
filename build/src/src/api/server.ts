import express from "express";
import bodyParser from "body-parser";
import * as methods from "../calls";
import { getRpcHandler } from "./getRpcHandler";
import { logs } from "../logs";
import { LoggerMiddleware } from "../types";
import { wrapHandler } from "./utils";
import { isAdmin } from "./auth";

const authorizedIpPrefixes = [
  // Admin users connecting from the VPN
  "172.33.10.",
  // Admin users connecting from the WIFI
  "172.33.12.",
  // WIFI DNP ip, which may be applied to users in some situations
  "172.33.1.10",
  // DAPPMANAGER IP
  "172.33.1.7"
];

/**
 * HTTP API
 *
 * [NOTE] This API is not secure
 * - It can't use HTTPS for the limitations with internal IPs certificates
 */
export function startHttpApi(port: number) {
  const app = express();

  // RPC
  const routesLogger: LoggerMiddleware = {
    onCall: (method, args) => logs.debug(`RPC call ${method}`, args || []),
    onSuccess: (method, result) => logs.debug(`RPC success ${method}`, result),
    onError: (method, e) => logs.error(`RPC error ${method}`, e)
  };
  const rpcHandler = getRpcHandler(methods, routesLogger);

  app.use(bodyParser.json());

  // Ping / hello endpoint
  app.get("/", (req, res) => res.send("VPN HTTP API"));

  // Rest of RPC methods
  app.post(
    "/rpc",
    isAdmin,
    wrapHandler(async (req, res) => res.send(await rpcHandler(req.body)))
  );

  app.listen(port, () => logs.info(`HTTP API started at ${port}`));
}
