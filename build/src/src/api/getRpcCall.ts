import got from "got";
import { Routes, routesData } from "../api/routes";
import { mapValues } from "lodash";
import { Args, Result } from "../types";

interface RpcResponse {
  result?: Result;
  error?: { code: number; message: string; data: string };
}

export function getRpcCall(vpnApiRpcUrl: string): Routes {
  return mapValues(routesData, (_0, route) => {
    return async function(...args: Args): Promise<Result> {
      const body = await got
        .post(vpnApiRpcUrl, { json: { method: route, params: args } })
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
