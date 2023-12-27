import express from "express";
import { logs } from "../logs";
import { promisify } from "util";
import dns from "dns";

const resolveIp = promisify(dns.resolve4);

const allowAllIps = Boolean(process.env.ALLOW_ALL_IPS);

if (allowAllIps) logs.warn(`WARNING! ALLOWING ALL IPFS`);

// Authorize by IP

const adminDomains = ["dappmanager.dappnode", "wifi.dappnode"];
// Necessary in case the domain cannot be resolved
const fallbackDomainIps = ["10.20.0.10", "10.20.0.7"];

const adminIps = [
  // Admin users connecting from the VPN
  "10.20.10.",
  // Admin users connecting from the WIFI
  "10.20.12.",
  // Also localhost calls
  "127.0.0.1"
];

const localhostIps = [
  // Internal calls from the same container
  "127.0.0.1"
];

// Needs to be called on startup
export async function resolveAdminIps() {
  try {
    const resolvedIps = await Promise.all(adminDomains.map(domain => resolveIp(domain)));
    resolvedIps.flat().forEach(ip => adminIps.push(ip));
    logs.info(`Resolved admin domains (including dappmanager and wifi): ${adminIps}`);
  } catch (error) {
    logs.error(`Error resolving admin domains (dappmanager and wifi): ${error}`);
    logs.warn(`Falling back to default IPs: ${fallbackDomainIps}`);
    adminIps.push(...fallbackDomainIps);
  }
}

function isAdminIp(ip: string): boolean {
  return allowAllIps || adminIps.some(_ip => ip.includes(_ip));
}

function isLocalhostIp(ip: string): boolean {
  return allowAllIps || localhostIps.some(_ip => ip.includes(_ip));
}

export const isAdmin: express.RequestHandler = (req, res, next) => {
  const ip = req.ip;
  if (isAdminIp(ip)) next();
  else res.status(403).send(`Requires admin permission. Forbidden ip: ${ip}`);
};

export const isLocalhost: express.RequestHandler = (req, res, next) => {
  const ip = req.ip;
  if (isLocalhostIp(ip)) next();
  else res.status(403).send(`Only localhost. Forbidden ip: ${ip}`);
};
