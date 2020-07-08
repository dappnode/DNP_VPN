/**
 * Reverse of parseEnvironment, stringifies envs object to envsArray
 * @param envs =
 * { NAME: "VALUE", NOVAL: "", COMPLEX: "D=D=D  = 2" }
 * @returns envsArray =
 * ["NAME=VALUE",  "NOVAL",   "COMPLEX=D=D=D  = 2"]
 */
export function printEnvironment(envs: { [key: string]: string }): string {
  return Object.entries(envs)
    .filter(([name]) => name)
    .map(([name, value]) => (value ? [name, value].join("=") : name))
    .join("\n");
}
