import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import * as methods from "../calls";
import { getRpcHandler } from "./getRpcHandler";
import { logs } from "../logs";
import { LoggerMiddleware } from "../types";
import { wrapHandler } from "./utils";
import { isAdmin, isLocalhost } from "./auth";
import { clientConnect } from "./clientConnect";

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
  app.post("/client-connect", isLocalhost, wrapHandler(clientConnect));

  app.listen(port, () => logs.info(`HTTP API started at ${port}`));
}

export function webServer() {
  const app = express();

  app.use(helmet());
  app.use(helmet.referrerPolicy());
  // 100 req every 15 minutes
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

  app.get("/", (req, res) => {
    res.send(400).send();
  });

  // Handle 404
  app.use((req, res) => {
    res.send(400).send();
  });

  // Handle 500
  app.use((error, req, res, next) => {
    res.send(500).send();
  });
}
