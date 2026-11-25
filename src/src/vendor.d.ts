// Ambient declarations for dependencies that ship no types

// stack-trace >= 1.0 is ESM-only
declare module "stack-trace" {
  export interface StackFrame {
    getTypeName(): string | null;
    getFunctionName(): string | null;
    getMethodName(): string | null;
    getFileName(): string | null;
    getLineNumber(): number | null;
    getColumnNumber(): number | null;
    isNative(): boolean | null;
  }
  export function get(belowFn?: () => void): StackFrame[];
  export function parse(err: Error): StackFrame[];
}

// qrcode-terminal ships no type declarations
declare module "qrcode-terminal" {
  const qrcode: {
    setErrorLevel(level: "L" | "M" | "Q" | "H" | "S"): void;
    generate(input: string, cb: (qr: string) => void): void;
    generate(
      input: string,
      opts: { small: boolean },
      cb: (qr: string) => void
    ): void;
  };
  export default qrcode;
}
