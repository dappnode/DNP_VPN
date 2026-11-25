import { Routes, routesData } from "../api/routes";
import { Args, Result } from "../types";
import { fetchText } from "../utils/fetch";

interface RpcResponse {
  result?: Result;
  error?: { code: number; message: string; data: string };
}

export function getRpcCall(vpnApiRpcUrl: string): Routes {
  const routes = Object.keys(routesData).map(route => [
    route,
    async function (...args: Args): Promise<Result> {
      const body = await postRpc(vpnApiRpcUrl, { method: route, params: args });
      // RPC response are always code 200
      return parseRpcResponse<Result>(body);
    }
  ]);
  return Object.fromEntries(routes) as Routes;
}

async function postRpc(
  url: string,
  payload: { method: string; params: Args }
): Promise<RpcResponse> {
  const text = await fetchText(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  return JSON.parse(text);
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
      error.stack = body.error.data + "\n" + (error.stack || "");
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
