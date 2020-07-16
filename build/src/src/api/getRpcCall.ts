import fs from "fs";
import url from "url";
import got from "got";
import { Routes, routesData } from "../api/routes";
import { mapValues } from "lodash";
import { Args, Result } from "../types";
import {
  RPC_TOKEN_HEADER,
  VPN_DNP_IP,
  API_PORT,
  RPC_TOKEN_PATH
} from "../params";

interface RpcResponse {
  result?: Result;
  error?: { code: number; message: string; data: string };
}

/**
 * Get an authorized JSON RPC client for the VPN API
 * Works calling from inside the same container as the VPN and from a separate
 * container as long as the rpcToken is available in both contexts
 */
export function getVpnRpcApiClient(): Routes {
  const vpnRpcApiUrl = url.format({
    protocol: "http",
    hostname: VPN_DNP_IP,
    port: API_PORT,
    pathname: "rpc"
  });
  const rpcToken = fs.readFileSync(RPC_TOKEN_PATH, "utf8");
  return getRpcCall(vpnRpcApiUrl, rpcToken);
}

/**
 * Call an external JSON RPC endpoint
 * @param vpnApiRpcUrl "http://localhost:3000/rpc"
 * @param rpcToken "8721944069..."
 */
export function getRpcCall(vpnApiRpcUrl: string, rpcToken: string): Routes {
  return mapValues(routesData, (_0, route) => {
    return async function(...args: Args): Promise<Result> {
      const body = await got
        .post(vpnApiRpcUrl, {
          json: { method: route, params: args },
          headers: { [RPC_TOKEN_HEADER]: rpcToken }
        })
        .json<RpcResponse>();

      // RPC response are always code 200
      return parseRpcResponse<Result>(body);
    };
  });
}

/**
 * Parse RPC response, to be used in the client
 * RPC response must always have code 200
 * @param body
 */
async function parseRpcResponse<R>(body: RpcResponse): Promise<R> {
  if (body.error) {
    const error = new JsonRpcResError(body.error);
    if (typeof body.error.data === "string") {
      // If data is of type string assume it's the error stack
      error.stack = body.error.data + "\n" + error.stack || "";
    }
    throw error;
  } else {
    return body.result;
  }
}

/**
 * Wrap JSON RPC response errors
 */
class JsonRpcResError extends Error {
  code: number;
  data?: string;
  constructor(jsonRpcError: RpcResponse["error"]) {
    super((jsonRpcError || {}).message);
    this.code = (jsonRpcError || {}).code || -32603;
    this.data = (jsonRpcError || {}).data;
  }
}
