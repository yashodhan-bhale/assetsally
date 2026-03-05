/**
 * Postinstall script to patch @expo/cli for Node 20 undici stream.tee() bug.
 *
 * This fixes the "stream.tee() is not a function" error when using
 * Expo CLI with Node 20's built-in fetch (undici).
 *
 * The patch:
 *   1. wrapFetchWithCache.js — reads body into a Buffer first, then creates
 *      a fresh Readable stream for caching (avoids stream.tee()).
 *   2. client.js — adds extra network error codes (ECONNREFUSED, ECONNRESET,
 *      ETIMEDOUT) and catches undici's generic "fetch failed" TypeError.
 */

const fs = require("fs");
const path = require("path");

// @expo/cli may be nested under expo's own node_modules with npm
const candidates = [
    path.join(__dirname, "..", "node_modules", "@expo", "cli"),
    path.join(
        __dirname,
        "..",
        "node_modules",
        "expo",
        "node_modules",
        "@expo",
        "cli"
    ),
];

const cliRoot = candidates.find((p) => fs.existsSync(p));

if (!cliRoot) {
    console.log("[patch-expo-cli] @expo/cli not found, skipping patch.");
    process.exit(0);
}

// ---------- Patch 1: wrapFetchWithCache.js ----------
const cacheFile = path.join(
    cliRoot,
    "build",
    "src",
    "api",
    "rest",
    "cache",
    "wrapFetchWithCache.js"
);

if (fs.existsSync(cacheFile)) {
    let src = fs.readFileSync(cacheFile, "utf8");
    // Only patch if not already patched
    if (!src.includes("PATCH: Read body into buffer")) {
        src = src
            // Replace the cache-set block that uses response.body directly
            .replace(
                /\/\/ Cache the response\s*\n\s*cachedResponse = await cache\.set\(cacheKey, \{\s*\n\s*body: response\.body,/,
                `// PATCH: Read body into buffer first to avoid Node 20 undici stream.tee() bug
            const bodyBuffer = Buffer.from(await response.arrayBuffer());
            const { Readable } = require('node:stream');
            const cacheBody = Readable.toWeb(Readable.from(bodyBuffer));
            // Cache the response using a cloned body stream
            cachedResponse = await cache.set(cacheKey, {
                body: cacheBody,`
            );

        // ONLY replace the return of cached response at the end of the fetch block
        src = src.replace(
            /cachedResponse = await cache\.set\([\s\S]*?return new \(_undici\(\)\)\.Response\(cachedResponse\.body, cachedResponse\.info\);/,
            `cachedResponse = await cache.set(cacheKey, {
                body: cacheBody,
                info: (0, _ResponseCache.getResponseInfo)(response)
            });
            // PATCH: return a new Response pointing to our bodyBuffer directly
            return new (_undici()).Response(bodyBuffer, (0, _ResponseCache.getResponseInfo)(response));`
        );

        // Remove the "warn through debug logs" block
        src = src.replace(
            /\/\/ Warn through debug logs that caching failed[\s\S]*?await cache\.remove\(cacheKey\);\s*\n\s*return response;\s*\n\s*\}/,
            ""
        );

        fs.writeFileSync(cacheFile, src, "utf8");
        console.log("[patch-expo-cli] Patched wrapFetchWithCache.js");
    } else {
        console.log("[patch-expo-cli] wrapFetchWithCache.js already patched.");
    }
}

// ---------- Patch 2: client.js ----------
const clientFile = path.join(
    cliRoot,
    "build",
    "src",
    "api",
    "rest",
    "client.js"
);

if (fs.existsSync(clientFile)) {
    let src = fs.readFileSync(clientFile, "utf8");

    if (!src.includes("PATCH: Also catch undici")) {
        // Add extra error codes to isNetworkError
        src = src.replace(
            /\[\s*'ENOTFOUND',\s*\n\s*'EAI_AGAIN',\s*\n\s*'UND_ERR_CONNECT_TIMEOUT'\s*\]/,
            `[
        'ENOTFOUND',
        'EAI_AGAIN',
        'UND_ERR_CONNECT_TIMEOUT',
        'ECONNREFUSED',
        'ECONNRESET',
        'ETIMEDOUT'
    ]`
        );

        // Add undici "fetch failed" TypeError check before the existing return
        src = src.replace(
            /function isNetworkError\(error\) \{/,
            `function isNetworkError(error) {
    // PATCH: Also catch undici's generic "fetch failed" TypeError (Node 20+)
    if (error instanceof TypeError && error.message === 'fetch failed') {
        return true;
    }`
        );

        fs.writeFileSync(clientFile, src, "utf8");
        console.log("[patch-expo-cli] Patched client.js");
    } else {
        console.log("[patch-expo-cli] client.js already patched.");
    }
}

console.log("[patch-expo-cli] Done.");
