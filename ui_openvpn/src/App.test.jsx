import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import nacl from "tweetnacl";
import naclUtil from "tweetnacl-util";
import App from "./App";
import decrypt from "./utils/decrypt";

function setUrl(path) {
  window.history.replaceState(null, "", path);
}

afterEach(() => {
  cleanup();
  setUrl("/");
});

describe("App", () => {
  it("shows an error when the URL has no credentials id", async () => {
    setUrl("/");
    render(<App />);
    expect(await screen.findByText(/No valid id provided/)).toBeTruthy();
  });

  it("renders the download view (dev=success)", async () => {
    setUrl("/?dev=success");
    render(<App />);
    expect(await screen.findByText("Download .ovpn")).toBeTruthy();
  });
});

describe("decrypt", () => {
  // Same scheme as the VPN backend: base64(nonce || secretbox(data, nonce, key))
  function encrypt(data, keyB64) {
    const key = naclUtil.decodeBase64(keyB64);
    const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
    const box = nacl.secretbox(naclUtil.decodeUTF8(data), nonce, key);
    const full = new Uint8Array(nonce.length + box.length);
    full.set(nonce);
    full.set(box, nonce.length);
    return naclUtil.encodeBase64(full);
  }

  it("decrypts a file encrypted by the backend scheme", () => {
    const key = naclUtil.encodeBase64(
      nacl.randomBytes(nacl.secretbox.keyLength),
    );
    const ovpn = "client\nremote example.dyndns.dappnode.io 1194 udp\n";
    expect(decrypt(encrypt(ovpn, key), key)).toBe(ovpn);
  });

  it("throws with a wrong key", () => {
    const key = naclUtil.encodeBase64(
      nacl.randomBytes(nacl.secretbox.keyLength),
    );
    const other = naclUtil.encodeBase64(
      nacl.randomBytes(nacl.secretbox.keyLength),
    );
    expect(() => decrypt(encrypt("data", key), other)).toThrow(
      /Could not decrypt/,
    );
  });
});
