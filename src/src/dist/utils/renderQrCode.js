"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderQrCode = void 0;
// Library does not have types
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
const qrcode_terminal_1 = __importDefault(require("qrcode-terminal"));
function renderQrCode(data) {
    return new Promise(resolve => {
        qrcode_terminal_1.default.setErrorLevel("S");
        qrcode_terminal_1.default.generate(data, resolve);
    });
}
exports.renderQrCode = renderQrCode;
//# sourceMappingURL=renderQrCode.js.map