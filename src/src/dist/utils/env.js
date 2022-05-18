"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printEnvironment = void 0;
/**
 * Reverse of parseEnvironment, stringifies envs object to envsArray
 * @param envs =
 * { NAME: "VALUE", NOVAL: "", COMPLEX: "D=D=D  = 2" }
 * @returns envsArray =
 * ["NAME=VALUE",  "NOVAL",   "COMPLEX=D=D=D  = 2"]
 */
function printEnvironment(envs) {
    return Object.entries(envs)
        .filter(([name]) => name)
        .map(([name, value]) => (value ? [name, value].join("=") : name))
        .join("\n");
}
exports.printEnvironment = printEnvironment;
//# sourceMappingURL=env.js.map