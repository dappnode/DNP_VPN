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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShellError = exports.shellArgs = exports.shell = void 0;
const dargs_1 = __importDefault(require("dargs"));
const child_process_1 = require("child_process");
/**
 * If timeout is greater than 0, the parent will send the signal
 * identified by the killSignal property (the default is 'SIGTERM')
 * if the child runs longer than timeout milliseconds.
 */
const defaultTimeout = 3 * 60 * 1000; // ms
const defaultMaxBuffer = 1e7; // bytes
/**
 * Run arbitrary commands in a shell
 * If the child process exits with code > 0, rejects
 * Note: using exec instead of spawn since it's not as safe to run
 * complex arbirary commands. For example:
 * - The executable docker-compose may not be detected, causing ENOENT
 * - Doing cmd > cmd2 may fail
 * - Flags may not be passed properly
 */
function shell(cmd, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!options.timeout)
            options.timeout = defaultTimeout;
        if (!options.maxBuffer)
            options.maxBuffer = defaultMaxBuffer;
        return new Promise((resolve, reject) => {
            child_process_1.exec(cmd, options, (err, stdout, stderr) => {
                if (err) {
                    // Rethrow a typed error, and ignore the internal NodeJS stack trace
                    if (err.signal === "SIGTERM")
                        reject(new ShellError(err, `cmd timeout ${options.timeout}: ${cmd}`));
                    else
                        reject(new ShellError(err));
                }
                else {
                    resolve(stdout.trim() || stderr);
                }
            });
        });
    });
}
exports.shell = shell;
/**
 * See `shell`.
 * Parses kwargs object with `dargs` and appends the result to the command
 */
function shellArgs(command, kwargs, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const args = dargs_1.default(kwargs, { useEquals: false }).join(" ");
        return yield shell(`${command} ${args}`, options);
    });
}
exports.shellArgs = shellArgs;
/**
 * Typed error implementing the native node child exception error
 * Can be rethrow to ignore the internal NodeJS stack trace
 */
class ShellError extends Error {
    constructor(e, message) {
        super(message || e.message);
        this.cmd = e.cmd;
        this.killed = e.killed;
        this.code = e.code;
        this.signal = e.signal;
        this.stdout = e.stdout;
        this.stderr = e.stderr;
    }
}
exports.ShellError = ShellError;
//# sourceMappingURL=shell.js.map