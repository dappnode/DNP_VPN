import fs from "fs";
import express from "express";
import { logs } from "../logs";
import { getRandomToken } from "../utils/crypto";
import { RPC_TOKEN_PATH, RPC_TOKEN_HEADER } from "../params";

const allowAllIps = Boolean(process.env.ALLOW_ALL_IPS);

// Authorize by IP

const adminIps = [
  // Admin users connecting from the VPN
  "172.33.10.",
  // Admin users connecting from the WIFI
  "172.33.12.",
  // WIFI DNP ip, which may be applied to users in some situations
  "172.33.1.10",
  // DAPPMANAGER IP
  "172.33.1.7",
  // Also localhost calls
  "127.0.0.1"
];

const localhostIps = [
  // Internal calls from the same container
  "127.0.0.1"
];

function isAdminIp(ip: string): boolean {
  return allowAllIps || adminIps.some(_ip => ip.includes(_ip));
}

function isLocalhostIp(ip: string): boolean {
  return allowAllIps || localhostIps.some(_ip => ip.includes(_ip));
}

/**
 * Initializes auth handlers with a random local token
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function getAuthHandlers() {
  if (allowAllIps) logs.warn(`WARNING! ALLOWING ALL IPFS`);
  if (!fs.existsSync(RPC_TOKEN_PATH))
    fs.writeFileSync(RPC_TOKEN_PATH, getRandomToken());
  const rpcToken = fs.readFileSync(RPC_TOKEN_PATH, "utf8");

  const isAdmin: express.RequestHandler = (req, res, next) => {
    const ip = req.ip;
    if (isAdminIp(ip) || req.header(RPC_TOKEN_HEADER) === rpcToken) next();
    else res.status(403).send(`Requires admin permission. Forbidden ip: ${ip}`);
  };

  const isLocalhost: express.RequestHandler = (req, res, next) => {
    const ip = req.ip;
    if (isLocalhostIp(ip)) next();
    else res.status(403).send(`Only localhost. Forbidden ip: ${ip}`);
  };

  return {
    isAdmin,
    isLocalhost
  };
}
