"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onDeviceConnected = exports.generateCredFileFromToken = exports.isTokenKnown = exports.getConnectUrl = exports.deleteTokenForId = exports.startCredentialsService = void 0;
const fs_1 = __importDefault(require("fs"));
const getClient_1 = require("../openvpn/getClient");
const crypto_1 = require("../utils/crypto");
const encrypt_1 = require("../utils/encrypt");
const config_1 = require("../config");
const formatCredUrl_1 = require("./formatCredUrl");
const logs_1 = require("../logs");
const params_1 = require("../params");
// Sharing credentials flow
// 1) ADMIN requests new link for `deviceId`
// 2) Server creates `idToken` that maps to `secretKey` and `deviceId`
// 3) ADMIN gets sharable link with http://$host:$port/?$idToken#$secretKey
// 4) New user opens the link, shared via a private channel
// 5) Server checks `idToken` is valid and unused
// 6) Server retrieves `secretKey` and `deviceId` from the DB
// 7) Server creates ovpn file for `deviceId` and encrypts it with `secretKey`
// 8) Server serves encrypted ovpn to the user
// 9) Server marks `idToken` as used but keeps it in the DB for some time
const tokenExpireMs = 5 * 24 * 60 * 60 * 1000; // 5 days
const tokenDeleteMs = 30 * 24 * 60 * 60 * 1000; // 30 days
const pruneTokensInterval = 24 * 60 * 60 * 1000; // 1 day
// Only one token per device. If the same url is requested twice give the same token
// OpenVPN + this NodeJS cannot differentiate different tokens used to get the same device
const tokens = new Map();
function startCredentialsService() {
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
exports.startCredentialsService = startCredentialsService;
function loadPersistedTokens() {
    try {
        const tokensData = JSON.parse(fs_1.default.readFileSync(params_1.TOKENS_DB_PATH, "utf8"));
        for (const [token, tokenData] of tokensData) {
            tokens.set(token, tokenData);
        }
    }
    catch (e) {
        if (e.code !== "ENOENT")
            logs_1.logs.error(`Error loading tokensData: ${e.message}`);
    }
}
function persistTokens() {
    try {
        const jsonText = JSON.stringify(Array.from(tokens.entries()), null, 2);
        fs_1.default.writeFileSync(params_1.TOKENS_DB_PATH, jsonText);
    }
    catch (e) {
        logs_1.logs.error(`Error persisting tokens: ${e.message}`);
    }
}
function garbageCollectTokens() {
    try {
        for (const [token, tokenData] of tokens)
            if (Date.now() - tokenData.created > tokenDeleteMs)
                tokens.delete(token);
    }
    catch (e) {
        logs_1.logs.error(`Error garbage collecting tokens: ${e.message}`);
    }
}
/**
 * Delete a device associated tokens when it's deleted
 * @param id "new-device"
 */
function deleteTokenForId(id) {
    for (const [token, tokenData] of tokens)
        if (tokenData.id === id)
            tokens.delete(token);
}
exports.deleteTokenForId = deleteTokenForId;
/**
 * Return a URL that a new user can browse to get access to their credentials
 * @param id "new-device"
 */
function getConnectUrl(id) {
    const { token, key } = getCredTokenAndKey(id);
    const hostname = config_1.config.hostname;
    if (!hostname)
        throw Error("hostname not set");
    return formatCredUrl_1.formatCredUrl({ hostname, token, key });
}
exports.getConnectUrl = getConnectUrl;
/**
 * Returns true if the token is known. It may be used or expired
 * Should be a very fast lookup since this check is exposed to arbitrary requests
 * @param token
 */
function isTokenKnown(token) {
    return tokens.has(token);
}
exports.isTokenKnown = isTokenKnown;
/**
 * Generate and encrypt a ovpn file with the stored token data
 * Check if the token is known, not used and not expired
 */
function generateCredFileFromToken(token) {
    return __awaiter(this, void 0, void 0, function* () {
        const tokenData = tokens.get(token);
        if (!tokenData)
            throw Error("Unknown token data");
        if (isTokenUsed(tokenData))
            throw Error("Token used");
        if (isTokenExpired(tokenData))
            throw Error("Token expired");
        const credFile = yield getClient_1.getClient(tokenData.id);
        return encrypt_1.encrypt(credFile, tokenData.key);
    });
}
exports.generateCredFileFromToken = generateCredFileFromToken;
/**
 * When device connects invalidate its associated token
 */
function onDeviceConnected(id) {
    for (const [token, tokenData] of tokens)
        if (tokenData.id === id) {
            const tokenData = tokens.get(token);
            if (tokenData)
                tokens.set(token, Object.assign(Object.assign({}, tokenData), { used: true }));
        }
}
exports.onDeviceConnected = onDeviceConnected;
function getCredTokenAndKey(id) {
    // Fetch old token if exists
    for (const [token, tokenData] of tokens)
        if (tokenData.id === id &&
            !isTokenUsed(tokenData) &&
            !isTokenExpired(tokenData))
            return { token, key: tokenData.key };
    // If no token, or used: create new token
    const token = crypto_1.getRandomToken(16);
    const key = encrypt_1.generateKey();
    tokens.set(token, { id, key, created: Date.now(), used: false });
    return { token, key };
}
function isTokenExpired(tokenData) {
    return Date.now() - tokenData.created > tokenExpireMs;
}
function isTokenUsed(tokenData) {
    return tokenData.used;
}
//# sourceMappingURL=credentialsFile.js.map