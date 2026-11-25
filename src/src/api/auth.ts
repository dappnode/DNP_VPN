import express from "express";
import { logs } from "../logs";

const allowAllIps = Boolean(process.env.ALLOW_ALL_IPS);

if (allowAllIps) logs.warn(`WARNING! ALLOWING ALL IPFS`);

const localhostIps = [
  // Internal calls from the same container
  "127.0.0.1",
  // Same address as seen by an IPv6 (dual-stack) socket
  "::ffff:127.0.0.1"
];

function isLocalhostIp(ip: string | undefined): boolean {
  return allowAllIps || (ip !== undefined && localhostIps.includes(ip));
}

export const isLocalhost: express.RequestHandler = (req, res, next) => {
  const ip = req.ip;
  if (isLocalhostIp(ip)) next();
  else res.status(403).send(`Only localhost. Forbidden ip: ${ip}`);
};
