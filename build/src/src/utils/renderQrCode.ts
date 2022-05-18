// Library does not have types
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import qrcode from "qrcode-terminal";

export function renderQrCode(data: string): Promise<string> {
  return new Promise(resolve => {
    qrcode.setErrorLevel("S");
    qrcode.generate(data, resolve);
  });
}
