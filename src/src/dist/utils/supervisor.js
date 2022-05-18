"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Supervisor = void 0;
const child_process_1 = require("child_process");
const signalsToPass = [
    "SIGTERM",
    "SIGINT",
    "SIGHUP",
    "SIGQUIT"
];
/**
 * Restarts a child process when it crashes
 * A restart can also be triggered manually
 * Typescript translation of https://github.com/petruisfan/node-supervisor
 * @param command
 * @param args
 * @param options
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function Supervisor(command, args, options) {
    const { instantKill, restartWait = 1000, log = console.log } = options || {};
    // State
    let child = null;
    let crashQueued = false;
    // Pass kill signals through to child
    for (const signal of signalsToPass) {
        process.on(signal, function () {
            killChild(signal);
            process.exit();
        });
    }
    process.on("exit", function () {
        killChild("SIGTERM");
    });
    function killChild(signal) {
        if (child) {
            log("Received " + signal + ", killing child process...");
            child.kill(signal);
        }
    }
    function startChild() {
        crashQueued = false;
        child = child_process_1.spawn(command, args, { stdio: "inherit" });
        log(`Starting child process with '${command} ${args.join(" ")}' ${child.pid}`);
        // Pipe output
        if (child.stdout)
            child.stdout.pipe(process.stdout);
        if (child.stderr)
            child.stderr.pipe(process.stderr);
        child.addListener("exit", function (code) {
            if (!crashQueued) {
                log(`Program ${command} ${args.join(" ")} exited with code ${code}`);
                child = null;
            }
            setTimeout(startChild, restartWait);
        });
    }
    function restartChild() {
        if (crashQueued)
            return;
        crashQueued = true;
        setTimeout(function () {
            if (!child)
                return startChild();
            if (instantKill) {
                process.kill(child.pid, "SIGKILL");
            }
            else {
                process.kill(child.pid, "SIGTERM");
            }
        }, 50);
    }
    return {
        restart: restartChild,
        child
    };
}
exports.Supervisor = Supervisor;
//# sourceMappingURL=supervisor.js.map