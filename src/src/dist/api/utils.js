"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapHandler = exports.HttpError = void 0;
class HttpError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code || 500;
    }
}
exports.HttpError = HttpError;
/**
 * Wrap express routes to be able to safely throw errors and return JSON
 * @param handler
 */
function wrapHandler(handler) {
    return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
        try {
            yield handler(req, res, next);
        }
        catch (e) {
            const error = { message: e.message, data: e.stack };
            if (e instanceof HttpError) {
                res.status(e.code).send({ error });
            }
            else {
                res.status(500).send({ error });
            }
        }
    });
}
exports.wrapHandler = wrapHandler;
//# sourceMappingURL=utils.js.map