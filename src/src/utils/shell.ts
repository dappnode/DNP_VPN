import { execFile, ExecFileException, ExecFileOptions } from "child_process";

/**
 * If timeout is greater than 0, the parent will send the signal
 * identified by the killSignal property (the default is 'SIGTERM')
 * if the child runs longer than timeout milliseconds.
 */

const defaultTimeout = 3 * 60 * 1000; // ms
const defaultMaxBuffer = 1e7; // bytes

/**
 * Run an executable with a list of arguments, without a shell.
 * Arguments are passed verbatim to the process, so they are never
 * interpreted by a shell (no word splitting, globbing or substitution).
 * If the child process exits with code > 0, rejects
 */
export async function shell(
  command: string,
  args: string[] = [],
  options: ExecFileOptions = {}
): Promise<string> {
  const opts: ExecFileOptions = {
    ...options,
    timeout: options.timeout || defaultTimeout,
    maxBuffer: options.maxBuffer || defaultMaxBuffer,
    encoding: "utf8"
  };
  const cmd = [command, ...args].join(" ");

  return new Promise((resolve, reject): void => {
    execFile(command, args, opts, (err, stdout, stderr) => {
      const out = String(stdout);
      const errOut = String(stderr);
      if (err) {
        // Rethrow a typed error, and ignore the internal NodeJS stack trace
        const e = Object.assign(err, { stdout: out, stderr: errOut });
        if (err.signal === "SIGTERM")
          reject(new ShellError(e, `cmd timeout ${opts.timeout}: ${cmd}`));
        else reject(new ShellError(e));
      } else {
        resolve(out.trim() || errOut);
      }
    });
  });
}

/**
 * Typed error implementing the native node child exception error
 * Can be rethrow to ignore the internal NodeJS stack trace
 */
export class ShellError extends Error implements ExecFileException {
  cmd?: string;
  killed?: boolean;
  code?: string | number | null;
  signal?: NodeJS.Signals;
  stdout?: string;
  stderr?: string;
  constructor(
    e: ExecFileException & { stdout?: string; stderr?: string },
    message?: string
  ) {
    super(message || e.message);
    this.cmd = e.cmd;
    this.killed = e.killed;
    this.code = e.code;
    this.signal = e.signal ?? undefined;
    this.stdout = e.stdout;
    this.stderr = e.stderr;
  }
}
