/**
 * Verification for ForgeRemoteSigner.
 *
 * Run with `npm run test:signing` (builds first, then `node test/signing.verify.cjs`).
 *
 * Why a standalone script instead of a jest test: @cosmjs (and its @noble/hashes v2
 * dependency) is published as pure ESM. The repo's jest/ts-jest setup cannot transpile
 * those node_modules, but Node (>=18, with require-ESM interop) runs them fine. This
 * script stands up a fake backend that signs with a local secp256k1 key and asserts the
 * signature ForgeRemoteSigner returns verifies against the wallet's public key.
 */
const assert = require("node:assert/strict");
const {
  Secp256k1,
  Secp256k1Signature,
  sha256,
} = require("@cosmjs/crypto");
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
      }),
    /does not match pubkey-derived address/,
  );

  console.log("OK: ForgeRemoteSigner getAccounts + signDirect + address checks passed");
}

main().catch((err) => {
  console.error("FAIL:", err && err.message ? err.message : err);
  process.exit(1);
});
