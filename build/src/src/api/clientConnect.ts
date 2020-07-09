import express from "express";
import { removeCredFile } from "../openvpn/credentialsFile";

/**
 * Hook called by openvpn binary on each client connection
 * Must attach its entire environment as a JSON body
 */
export const clientConnect: express.RequestHandler = (req, res) => {
  const ovpnEnv: OpenVpnClientConnectEnv = req.body;
  if (ovpnEnv.script_type !== "client-connect")
    throw Error("Only client-connect script allowed");
  if (!ovpnEnv.common_name) throw Error("No common_name provided");

  removeCredFile(ovpnEnv.common_name);
  res.send(`${ovpnEnv.common_name} connected`);
};

/**
 * Environment injected by OpenVPN in the client_connect script hook
 */
interface OpenVpnClientConnectEnv {
  script_type: string; // "client-connect";
  time_unix: string; // "1594252007";
  time_ascii: string; // "Wed Jul  8 23:46:47 2020";
  ifconfig_pool_netmask: string; // "255.255.252.0";
  ifconfig_pool_remote_ip: string; // "172.33.10.1";
  trusted_port: string; // "59066";
  trusted_ip: string; // "176.83.107.37";
  common_name: string; // "dappnode_admin";
  untrusted_port: string; // "59066";
  untrusted_ip: string; // "176.83.107.37";
  X509_0_CN: string; // "dappnode_admin";
  X509_1_CN: string; // "b16cecf0e7baaf09.dyndns.dappnode.io";
  remote_port_1: string; // "1194";
  local_port_1: string; // "1194";
  proto_1: string; // "udp";
  // Plus more variables that are not relevant (TLS, IV, config, etc)
}
