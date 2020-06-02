const express = require("express");
const bodyParser = require("body-parser");
const methods = require("./calls");
const getRpcHandler = require("./utils/getRpcHandler");
const logs = require("./logs.js")(module);

const authorizedIpPrefixes = [
  // Admin users connecting from the VPN
  "172.33.10.",
  // Admin users connecting from the WIFI
  "172.33.12.",
  // WIFI DNP ip, which may be applied to users in some situations
  "172.33.1.10",
  // DAPPMANAGER IP
  "172.33.1.7",
];

/**
 * HTTP API
 *
 * [NOTE] This API is not secure
 * - It can't use HTTPS for the limitations with internal IPs certificates
 */
module.exports = function startHttpApi(port) {
  const app = express();

  // RPC
  const loggerMiddleware = {
    onCall: (method, params) => logs.debug(`RPC call ${method}`, params),
    onSuccess: (method, result) => logs.debug(`RPC success ${method}`, result),
    onError: (method, e) => logs.error(`RPC error ${method}`, e),
  };
  const rpcHandler = getRpcHandler(methods, loggerMiddleware);

  app.use(bodyParser.json());

  // Ping / hello endpoint
  app.get("/", (req, res) => res.send("VPN HTTP API"));

  // Rest of RPC methods
  app.post(
    "/rpc",
    isAuthorized,
    wrapHandler(async (req, res) => res.send(await rpcHandler(req.body)))
  );

  app.listen(port, () => logs.info(`HTTP API ${port}!`));
};

/**
 * Wrap express routes to be able to safely throw errors and return JSON
 * @param handler
 */
function wrapHandler(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (e) {
      res.status(500).send({ error: { message: e.message, data: e.stack } });
    }
  };
}

/**
 * Auth middleware, filtering by IP
 */
function isAuthorized(req, res, next) {
  const isIpAllowed = authorizedIpPrefixes.some((ip) => req.ip.includes(ip));

  if (isIpAllowed) {
    next();
  } else {
    res.status(403).send(`Requires admin permission. Forbidden ip: ${req.ip}`);
  }
}
