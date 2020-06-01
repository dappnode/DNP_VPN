/**
 * Given a set of method handlers, parse a RPC request and handle it
 * @param methods
 * @param loggerMiddleware
 */
module.exports = (methods, loggerMiddleware) => async (body) => {
  const { onCall, onSuccess, onError } = loggerMiddleware || {};

  try {
    const { method, params } = parseRpcRequest(body);

    // Get handler
    const handler = methods[method];
    if (!handler) throw new JsonRpcError(`Method not found ${method}`);
    if (onCall) onCall(method, params);

    const result = await handler(...params);
    if (onSuccess) onSuccess(method, result, params);
    return { result };
  } catch (e) {
    if (e instanceof JsonRpcError) {
      return { error: { code: e.code, message: e.message } };
    } else {
      // Unexpected error, log and send more details
      const { method, params } = tryToParseRpcRequest(body);
      if (onError) onError(method || "unknown-method", e, params || []);
      return { error: { code: -32603, message: e.message, data: e.stack } };
    }
  }
};

/**
 * Parse RPC request, to be used in the server
 * @param body
 */
function parseRpcRequest(body) {
  if (typeof body !== "object")
    throw Error(`body request must be an object, ${typeof body}`);
  const { method, params } = body;
  if (!method) throw new JsonRpcError("request body missing method");
  if (!params) throw new JsonRpcError("request body missing params");
  if (!Array.isArray(params))
    throw new JsonRpcError("request body params must be an array");
  return { method, params };
}

function tryToParseRpcRequest(body) {
  try {
    return parseRpcRequest(body);
  } catch (e) {
    return {};
  }
}

class JsonRpcError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code || -32603;
  }
}
