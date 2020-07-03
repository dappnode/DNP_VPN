import { Routes } from "./routes";
import { LoggerMiddleware, RpcRequest, RpcResponse } from "../types";

/**
 * Given a set of method handlers, parse a RPC request and handle it
 * @param methods
 * @param loggerMiddleware
 */
export const getRpcHandler = (
  methods: Routes,
  loggerMiddleware?: LoggerMiddleware
): ((body: RpcRequest) => Promise<RpcResponse>) => {
  const { onCall, onSuccess, onError } = loggerMiddleware || {};

  return async (body: RpcRequest): Promise<RpcResponse> => {
    try {
      const { method, params } = parseRpcRequest(body);

      // Get handler
      const handler = methods[method] as (
        ...params: RpcRequest["params"]
      ) => Promise<RpcResponse["result"]>;
      if (!handler) throw new JsonRpcReqError(`Method not found ${method}`);
      if (onCall) onCall(method, params);

      const result = await handler(...params);
      if (onSuccess) onSuccess(method, result, params);
      return { result };
    } catch (e) {
      if (e instanceof JsonRpcReqError) {
        // JSON RPC request formating errors, do not log
        return { error: { code: e.code, message: e.message } };
      } else {
        // Unexpected error, log and send more details
        const { method, params } = tryToParseRpcRequest(body);
        if (onError) onError(method || "unknown-method", e, params || []);
        return { error: { code: -32603, message: e.message, data: e.stack } };
      }
    }
  };
};

/**
 * Parse RPC request, to be used in the server
 * @param body
 */
function parseRpcRequest(
  body: RpcRequest
): { method: keyof Routes; params: RpcRequest["params"] } {
  if (typeof body !== "object")
    throw Error(`body request must be an object, ${typeof body}`);
  const { method, params } = body;
  if (!method) throw new JsonRpcReqError("request body missing method");
  if (!params) throw new JsonRpcReqError("request body missing params");
  if (!Array.isArray(params))
    throw new JsonRpcReqError("request body params must be an array");
  return {
    method: method as keyof Routes,
    params
  };
}

function tryToParseRpcRequest(body: RpcRequest): Partial<RpcRequest> {
  try {
    return parseRpcRequest(body);
  } catch {
    return {};
  }
}

/**
 * Errors specific to JSON RPC request payload formating
 */
class JsonRpcReqError extends Error {
  code: number;
  constructor(message?: string, code?: number) {
    super(message);
    this.code = code || -32603;
  }
}
