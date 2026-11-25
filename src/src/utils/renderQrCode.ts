import qrcode from "qrcode-terminal";

export function renderQrCode(data: string): Promise<string> {
  return new Promise(resolve => {
    qrcode.setErrorLevel("S");
    qrcode.generate(data, resolve);
  });
}
