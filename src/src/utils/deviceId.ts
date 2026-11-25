/**
 * Rejects device ids that could escape the PKI directories or be parsed as
 * options by easyrsa and the ovpn_* scripts.
 *
 * Device ids are used as file names (pki/issued/<id>.crt, ...) and as
 * positional arguments to external commands. Whitespace never worked as
 * those commands receive the id unquoted, so it is rejected as well.
 * Glob characters would be expanded by the ovpn_* scripts, and a comma
 * breaks the CSV output of ovpn_listclients.
 */
export function assertValidDeviceId(id: unknown): asserts id is string {
  if (typeof id !== "string") throw Error("Device id must be a string");
  if (id === "") throw Error("The device name cannot be empty");
  if (id === "." || id === "..") throw Error(`Invalid device name: ${id}`);
  if (id.startsWith("-"))
    throw Error(`Device name cannot start with "-": ${id}`);
  // Path separators, whitespace and control characters
  // eslint-disable-next-line no-control-regex
  if (/[/\\\s\x00-\x1f\x7f]/.test(id))
    throw Error(
      `Device name cannot contain slashes, whitespace or control characters: ${JSON.stringify(id)}`
    );
  if (/[*?[\],]/.test(id))
    throw Error(`Device name cannot contain any of * ? [ ] , : ${id}`);
}
