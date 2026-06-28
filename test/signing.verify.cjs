/**
 * Verification for ForgeRemoteSigner.
 *
 * Run with `npm run test:signing` (builds first, then `node test/signing.verify.cjs`).
 *
 * Why a standalone script instead of a jest test: @cosmjs (and its @noble/hashes v2
 * dependency) is published as pure ESM. The repo's jest/ts-jest setup cannot transpile
 * those node_modules, but Node (>=20.19, where require(ESM) is supported) runs them
 * fine. This script stands up a fake backend that signs with a local secp256k1 key and
 * asserts both the happy path (signature verifies against the wallet pubkey) and the
 * failure modes (bad address, missing fields, short signature, pubkey rotation, etc.).
 */
const assert = require("node:assert/strict");
const { Secp256k1, Secp256k1Signature, sha256 } = require("@cosmjs/crypto");
const { fromBase64, fromHex, toBech32, toHex } = require("@cosmjs/encoding");
const { rawSecp256k1PubkeyToRawAddress } = require("@cosmjs/amino");
const { makeSignBytes } = require("@cosmjs/proto-signing");
const { ForgeRemoteSigner } = require("../dist/src/v2/signing.js");

async function main() {
  const privkey = fromHex("aa".repeat(32));
  const keypair = await Secp256k1.makeKeypair(privkey);
  const pubkey = Secp256k1.compressPubkey(keypair.pubkey);
  const address = toBech32("allo", rawSecp256k1PubkeyToRawAddress(pubkey));

  // Fake Forge backend: GET returns wallet info; POST signs with the local key.
  const fetchFn = async (_url, init) => {
    if (init && init.method === "POST") {
      const body = JSON.parse(init.body);
      const payload = fromHex(body.payload);
      const digest = body.prehashed ? payload : sha256(payload);
      const sig = await Secp256k1.createSignature(digest, privkey);
      const sig64 = sig.toFixedLength().slice(0, 64); // drop recovery byte
      return {
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({ signature: toHex(sig64), pubkey: toHex(pubkey) }),
      };
    }
    return {
      ok: true,
      status: 200,
      text: async () =>
        JSON.stringify({ id: "w", address, pubkey: toHex(pubkey) }),
    };
  };

  const signer = await ForgeRemoteSigner.create({
    backendUrl: "http://forge.test",
    apiKey: "forge_sk_test",
    walletId: "w",
    fetchFn,
    allowInsecureHttp: true,
  });

  const accounts = await signer.getAccounts();
  assert.equal(accounts.length, 1);
  assert.equal(accounts[0].address, address, "account address should match");
  assert.equal(accounts[0].algo, "secp256k1");

  const signDoc = {
    bodyBytes: Uint8Array.from([1, 2, 3, 4]),
    authInfoBytes: Uint8Array.from([5, 6, 7, 8]),
    chainId: "allora-testnet-1",
    accountNumber: BigInt(7),
  };
  const resp = await signer.signDirect(address, signDoc);

  const messageHash = sha256(makeSignBytes(signDoc));
  const sigBytes = fromBase64(resp.signature.signature);
  assert.equal(sigBytes.length, 64, "signature should be 64 bytes");
  const signature = new Secp256k1Signature(
    sigBytes.slice(0, 32),
    sigBytes.slice(32, 64),
  );
  assert.ok(
    await Secp256k1.verifySignature(signature, messageHash, keypair.pubkey),
    "signDirect signature must verify against the wallet pubkey",
  );

  // A backend address inconsistent with the pubkey must be rejected.
  const badFetch = async () => ({
    ok: true,
    status: 200,
    text: async () =>
      JSON.stringify({ id: "w", address: "allo1wrong", pubkey: toHex(pubkey) }),
  });
  await assert.rejects(
    () =>
      ForgeRemoteSigner.create({
        backendUrl: "http://forge.test",
        apiKey: "k",
        walletId: "w",
        fetchFn: badFetch,
        allowInsecureHttp: true,
      }),
    /does not match pubkey-derived address/,
  );

  // --- Negative paths -------------------------------------------------------

  const okJson = (obj) => ({
    ok: true,
    status: 200,
    text: async () => JSON.stringify(obj),
  });
  const createWith = (walletFetch, apiKey = "k") =>
    ForgeRemoteSigner.create({
      backendUrl: "http://forge.test",
      apiKey,
      walletId: "w",
      fetchFn: walletFetch,
      allowInsecureHttp: true,
    });

  // A non-HTTPS backend is rejected unless allowInsecureHttp is set.
  await assert.rejects(
    () =>
      ForgeRemoteSigner.create({
        backendUrl: "http://forge.test",
        apiKey: "k",
        walletId: "w",
        fetchFn,
      }),
    /must use https/,
  );

  // An empty wallet-info id must fail closed: it cannot bind the response to the
  // requested wallet, so a mis-routed/cache-poisoned response is not accepted.
  await assert.rejects(
    () =>
      createWith(async () =>
        okJson({ id: "", address, pubkey: toHex(pubkey) }),
      ),
    /missing 'id'/,
  );

  // An empty backend address must not silently bypass the cross-check.
  await assert.rejects(
    () =>
      createWith(async () =>
        okJson({ id: "w", address: "", pubkey: toHex(pubkey) }),
      ),
    /missing 'address'/,
  );

  // An absent pubkey fails with Forge context.
  await assert.rejects(
    () => createWith(async () => okJson({ id: "w", address })),
    /missing 'pubkey'/,
  );

  // An HTTP 500 surfaces the status and a non-empty body preview.
  await assert.rejects(
    () =>
      createWith(async () => ({
        ok: false,
        status: 500,
        text: async () => "internal error",
      })),
    /Forge backend returned 500: internal error/,
  );

  // The X-Forge-API-Key header is actually sent on requests.
  let sentApiKey;
  await createWith(async (_url, init) => {
    sentApiKey = init && init.headers && init.headers["X-Forge-API-Key"];
    return okJson({ id: "w", address, pubkey: toHex(pubkey) });
  }, "forge_sk_header");
  assert.equal(
    sentApiKey,
    "forge_sk_header",
    "X-Forge-API-Key header must be sent",
  );

  // A wrong signerAddress is rejected before any backend call.
  await assert.rejects(
    () => signer.signDirect("allo1someoneelse", signDoc),
    /does not match signer address/,
  );

  // A non-64-byte backend signature is rejected with a length message.
  const shortSigSigner = await createWith(async (_url, init) =>
    init && init.method === "POST"
      ? okJson({ signature: "ab".repeat(63), pubkey: toHex(pubkey) })
      : okJson({ id: "w", address, pubkey: toHex(pubkey) }),
  );
  await assert.rejects(
    () => shortSigSigner.signDirect(address, signDoc),
    /expected 64/,
  );

  // A /sign response echoing a different pubkey (rotation/mis-routing) is rejected.
  const otherKeypair = await Secp256k1.makeKeypair(fromHex("bb".repeat(32)));
  const otherPubkey = Secp256k1.compressPubkey(otherKeypair.pubkey);
  const rotatedSigner = await createWith(async (_url, init) => {
    if (init && init.method === "POST") {
      const body = JSON.parse(init.body);
      const sig = await Secp256k1.createSignature(
        sha256(fromHex(body.payload)),
        privkey,
      );
      return okJson({
        signature: toHex(sig.toFixedLength().slice(0, 64)),
        pubkey: toHex(otherPubkey),
      });
    }
    return okJson({ id: "w", address, pubkey: toHex(pubkey) });
  });
  await assert.rejects(
    () => rotatedSigner.signDirect(address, signDoc),
    /does not match the wallet pubkey/,
  );

  // A /sign response that echoes the CORRECT pubkey but returns a (valid 64-byte)
  // signature over a different payload passes the echo + length checks but must be
  // rejected by the local cryptographic verification against the cached pubkey.
  const corruptSigner = await createWith(async (_url, init) => {
    if (init && init.method === "POST") {
      const wrongSig = await Secp256k1.createSignature(
        sha256(Uint8Array.from([0xde, 0xad, 0xbe, 0xef])),
        privkey,
      );
      return okJson({
        signature: toHex(wrongSig.toFixedLength().slice(0, 64)),
        pubkey: toHex(pubkey),
      });
    }
    return okJson({ id: "w", address, pubkey: toHex(pubkey) });
  });
  await assert.rejects(
    () => corruptSigner.signDirect(address, signDoc),
    /failed local verification/,
  );

  // A /sign response that OMITS the pubkey echo must fail closed even when the
  // signature itself would verify, so a backend cannot strip the echo to dodge the
  // rotation/mis-route check.
  const noEchoSigner = await createWith(async (_url, init) => {
    if (init && init.method === "POST") {
      const body = JSON.parse(init.body);
      const sig = await Secp256k1.createSignature(
        sha256(fromHex(body.payload)),
        privkey,
      );
      return okJson({ signature: toHex(sig.toFixedLength().slice(0, 64)) });
    }
    return okJson({ id: "w", address, pubkey: toHex(pubkey) });
  });
  await assert.rejects(
    () => noEchoSigner.signDirect(address, signDoc),
    /missing 'pubkey' echo/,
  );

  // signDigest signs a 32-byte digest as-is (prehashed) and the result verifies.
  const digest = sha256(Uint8Array.from([9, 9, 9]));
  const digestSig = await signer.signDigest(digest);
  assert.equal(digestSig.length, 64, "signDigest returns a 64-byte signature");
  assert.ok(
    await Secp256k1.verifySignature(
      new Secp256k1Signature(digestSig.slice(0, 32), digestSig.slice(32, 64)),
      digest,
      keypair.pubkey,
    ),
    "signDigest signature must verify against the wallet pubkey",
  );
  await assert.rejects(
    () => signer.signDigest(Uint8Array.from([1, 2, 3])),
    /must be 32 bytes/,
  );

  console.log(
    "OK: ForgeRemoteSigner positive + negative signing checks passed",
  );
}

main().catch((err) => {
  console.error("FAIL:", err && err.message ? err.message : err);
  process.exit(1);
});
