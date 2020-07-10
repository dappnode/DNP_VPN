import express from "express";

const allowAllIps = Boolean(process.env.ALLOW_ALL_IPS);

if (allowAllIps) console.log(`WARNING! ALLOWING ALL IPFS`);

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

const localhostIp = [
  // Internal calls from the same container
  "127.0.0.1"
];

function isAdminIp(ip: string): boolean {
  return allowAllIps || adminIps.some(_ip => ip.includes(_ip));
}

function isLocalhostIp(ip: string): boolean {
  return allowAllIps || localhostIp.some(_ip => ip.includes(_ip));
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
