import fs from "fs";
import { getClient } from "../openvpn/getClient";
import { getRandomToken } from "../utils/crypto";
import { encrypt, generateKey } from "../utils/encrypt";
import { config } from "../config";
import { formatCredUrl } from "./formatCredUrl";
import { logs } from "../logs";
import { TOKENS_DB_PATH } from "../params";

const tokenExpireMs = 5 * 24 * 60 * 60 * 1000; // 5 days
const tokenDeleteMs = 30 * 24 * 60 * 60 * 1000; // 30 days
const pruneTokensInterval = 24 * 60 * 60 * 1000; // 1 day

interface TokenData {
  id: string;
  key: string;
  created: number;
  used: boolean;
}

const tokens = new Map<string, TokenData>();

// Only one token per device. If the same url is requested twice give the same token
// OpenVPN + this NodeJS cannot differentiate different tokens used to get the same device

export function startCredentialsService() {
  loadPersistedTokens();

  process.on("exit", persistTokens);
  process.on("SIGTERM", persistTokens);
  process.on("SIGINT", persistTokens);
  process.on("SIGUSR1", persistTokens);
  process.on("SIGUSR2", persistTokens);
  process.on("uncaughtException", persistTokens);

  // To prevent the tokens Map from growing too large, run this function sometimes
  setInterval(garbageCollectTokens, pruneTokensInterval);
}

function loadPersistedTokens(): void {
  try {
    const tokensData = JSON.parse(fs.readFileSync(TOKENS_DB_PATH, "utf8"));
    for (const [token, tokenData] of tokensData) {
      tokens.set(token, tokenData);
    }
  } catch (e) {
    if (e.code !== "ENOENT")
      logs.error(`Error loading tokensData: ${e.message}`);
  }
}

function persistTokens(): void {
  try {
    const jsonText = JSON.stringify(Array.from(tokens.entries()), null, 2);
    fs.writeFileSync(TOKENS_DB_PATH, jsonText);
  } catch (e) {
    logs.error(`Error persisting tokens: ${e.message}`);
  }
}

function garbageCollectTokens(): void {
  try {
    for (const [token, tokenData] of tokens)
      if (Date.now() - tokenData.created > tokenDeleteMs) tokens.delete(token);
  } catch (e) {
    logs.error(`Error garbage collecting tokens: ${e.message}`);
  }
}

// Sharing credentials flow
// 1) ADMIN create a new link for a given `deviceId`
// 2) Server creates `idToken` that maps to `secretKey` (created), `deviceId`
// 3) ADMIN gets sharable link with http://$host:$port/?$idToken#$secretKey
// 4) New user opens the link, shared via a private channel
// 5) Server checks `idToken` is valid and unused
// 6) Server retrieves `secretKey` and `deviceId` from the DB
// 7) Server creates ovpn file for `deviceId` and encrypts it with `secretKey`
// 8) Server send encrypted ovpn to the user
// 9) Server marks `idToken` as used but keeps it in the DB for some time

/**
 * Return a URL that a new user can browse to get access to their credentials
 * @param id
 */
export function getConnectUrl(id: string): string {
  const { token, key } = getCredTokenAndKey(id);

  const hostname = config.hostname;
  if (!hostname) throw Error("hostname not set");

  return formatCredUrl({ hostname, token, key });
}

/**
 * Returns true if the token is known. It may be used or expired
 * Should be a very fast lookup since this check is exposed to arbitrary requests
 * @param token
 */
export function isTokenKnown(token: string): boolean {
  return tokens.has(token);
}

/**
 * Generate and encrypt a ovpn file with the stored token data
 * Check if the token is known, not used and not expired
 */
export async function generateCredFileFromToken(token: string) {
  const tokenData = tokens.get(token);
  if (!tokenData) throw Error("Unknown token data");
  if (isTokenUsed(tokenData)) throw Error("Token used");
  if (isTokenExpired(tokenData)) throw Error("Token expired");
  const credFile = await getClient(tokenData.id);
  return encrypt(credFile, tokenData.key);
}

/**
 * When device connects invalidate its associated token
 */
export function onDeviceConnected(id: string): void {
  for (const [token, tokenData] of tokens)
    if (tokenData.id === id) {
      const tokenData = tokens.get(token);
      if (tokenData) tokens.set(token, { ...tokenData, used: true });
    }
}

function getCredTokenAndKey(id: string): { token: string; key: string } {
  // Fetch old token if exists
  for (const [token, tokenData] of tokens)
    if (
      tokenData.id === id &&
      !isTokenUsed(tokenData) &&
      !isTokenExpired(tokenData)
    )
      return { token, key: tokenData.key };

  // If no token, or used: create new token
  const token = getRandomToken();
  const key = generateKey();
  tokens.set(token, { id, key, created: Date.now(), used: false });
  return { token, key };
}

function isTokenExpired(tokenData: TokenData): boolean {
  return Date.now() - tokenData.created > tokenExpireMs;
}

function isTokenUsed(tokenData: TokenData): boolean {
  return tokenData.used;
}
