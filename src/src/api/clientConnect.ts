import express from "express";
import { onDeviceConnected } from "../credentials";

/**
 * Hook called by openvpn binary on each client connection
 * Must attach its entire environment as a JSON body
 */
export const clientConnect: express.RequestHandler = (req, res) => {
  const ovpnEnv: OpenVpnClientConnectEnv = req.body;
  if (ovpnEnv.script_type !== "client-connect")
    throw Error("Only client-connect script allowed");
  if (!ovpnEnv.common_name) throw Error("No common_name provided");

  onDeviceConnected(ovpnEnv.common_name);
  res.send(`${ovpnEnv.common_name} connected`);
};

/**
 * Environment injected by OpenVPN in the client_connect script hook
 */
interface OpenVpnClientConnectEnv {
  script_type: string; // 'client-connect',
  time_unix: string; // '1594372139',
  time_ascii: string; // 'Fri Jul 10 09:08:59 2020',
  ifconfig_pool_netmask: string; // '255.255.252.0',
  ifconfig_pool_remote_ip: string; // '172.33.10.1',
  trusted_port: string; // '60075',
  trusted_ip: string; // '89.132.183.92',
  common_name: string; // 'dappnode_admin',
  IV_TCPNL: string; // '1',
  IV_COMP_STUBv2: string; // '1',
  IV_COMP_STUB: string; // '1',
  IV_LZO: string; // '1',
  IV_LZ4v2: string; // '1',
  IV_LZ4: string; // '1',
  IV_NCP: string; // '2',
  IV_PROTO: string; // '2',
  IV_PLAT: string; // 'linux',
  IV_VER: string; // '2.4.4',
  untrusted_port: string; // '60075',
  untrusted_ip: string; // '89.132.183.92',
  tls_serial_hex_0: string; // 'da:05:14:b0:65:4f:94:1b:1d:31:d5:bf:29:b7:66:be',
  tls_serial_0: string; // '289798084189107200517215146893150480062',
  tls_digest_sha256_0: string; // 'fb:3e:b0:8f:5e:77:9e:b1:0e:ac:9e:ba:91:4f:11:d0:0a:c5:34:56:48:a6:dc:17:bf:ee:ca:49:9f:30:3c:e7',
  tls_digest_0: string; // 'd7:cd:26:a9:ae:71:99:4c:d0:39:45:2f:9a:51:2b:a2:43:d9:4d:23',
  tls_id_0: string; // 'CN=dappnode_admin',
  X509_0_CN: string; // 'dappnode_admin',
  tls_serial_hex_1: string; // 'c8:c2:15:45:70:37:15:40',
  tls_serial_1: string; // '14466148341047039296',
  tls_digest_sha256_1: string; // '74:67:84:3d:24:3a:28:d4:f6:91:29:dd:0f:4a:eb:5a:0c:e2:02:d0:e1:f0:1f:b6:db:28:dd:fe:2e:65:6b:1a',
  tls_digest_1: string; // '73:71:45:b3:de:6b:af:76:51:84:5f:72:a3:e5:29:08:fa:52:15:68',
  tls_id_1: string; // 'CN=b16cecf0e7baaf09.dyndns.dappnode.io',
  X509_1_CN: string; // 'b16cecf0e7baaf09.dyndns.dappnode.io',
  remote_port_1: string; // '1194',
  local_port_1: string; // '1194',
  proto_1: string; // 'udp',
  daemon_pid: string; // '38',
  daemon_start_time: string; // '1594252592',
  daemon_log_redirect: string; // '0',
  daemon: string; // '0',
  verb: string; // '3',
  config: string; // '/etc/openvpn/openvpn.conf',
  ifconfig_local: string; // '10.20.0.241' (s: "10.20.0.240/28")
  ifconfig_netmask: string; // '255.255.255.0',
  ifconfig_broadcast: string; // '10.20.0.255',
  script_context: string; // 'init',
  tun_mtu: string; // '1500',
  link_mtu: string; // '1622',
  dev: string; // 'tun0',
  dev_type: string; // 'tun',
  redirect_gateway: string; // '0'
}
