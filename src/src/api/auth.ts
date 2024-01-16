import express from "express";
import { logs } from "../logs";

const allowAllIps = Boolean(process.env.ALLOW_ALL_IPS);

if (allowAllIps) logs.warn(`WARNING! ALLOWING ALL IPFS`);

const localhostIps = [
  // Internal calls from the same container
  "127.0.0.1"
];

function isLocalhostIp(ip: string): boolean {
  return allowAllIps || localhostIps.some(_ip => ip.includes(_ip));
}

export const isLocalhost: express.RequestHandler = (req, res, next) => {
  const ip = req.ip;
  if (isLocalhostIp(ip)) next();
  else res.status(403).send(`Only localhost. Forbidden ip: ${ip}`);
};
