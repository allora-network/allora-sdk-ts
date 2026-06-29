/**
 * Verification for ForgeRemoteSigner.
 *
 * Run with `yarn test:signing` (builds first, then `node test/signing.verify.cjs`).
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
  // walletId must be a UUID (the SDK validates its shape at construction).
  const WALLET_ID = "11111111-1111-4111-8111-111111111111";

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
        JSON.stringify({ id: WALLET_ID, address, pubkey: toHex(pubkey) }),
    };
  };

  const signer = await ForgeRemoteSigner.create({
    backendUrl: "http://localhost",
    apiKey: "forge_sk_test",
    walletId: WALLET_ID,
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

  // --- clearAssociation -----------------------------------------------------
  // clearAssociation POSTs to /clear-association and must accept a 204 No Content.
  const walletInfo = () =>
    JSON.stringify({ id: WALLET_ID, address, pubkey: toHex(pubkey) });
  let clearedPath = null;
  const clearFetch = async (url, init) => {
    if (init && init.method === "POST" && url.endsWith("/clear-association")) {
      clearedPath = url;
      return { ok: true, status: 204, text: async () => "" };
    }
    return { ok: true, status: 200, text: async () => walletInfo() };
  };
  const clearSigner = await ForgeRemoteSigner.create({
    backendUrl: "http://localhost",
    apiKey: "forge_sk_test",
    walletId: WALLET_ID,
    fetchFn: clearFetch,
    allowInsecureHttp: true,
  });
  await clearSigner.clearAssociation();
  assert.equal(
    clearedPath,
    `http://localhost/api/v1/signing-wallets/${WALLET_ID}/clear-association`,
    "clearAssociation must POST to the wallet's clear-association path",
  );

  // A non-2xx clear-association response must reject.
  const clearFailFetch = async (url, init) => {
    if (init && init.method === "POST" && url.endsWith("/clear-association")) {
      return { ok: false, status: 404, text: async () => "not found" };
    }
    return { ok: true, status: 200, text: async () => walletInfo() };
  };
  const clearFailSigner = await ForgeRemoteSigner.create({
    backendUrl: "http://localhost",
    apiKey: "forge_sk_test",
    walletId: WALLET_ID,
    fetchFn: clearFailFetch,
    allowInsecureHttp: true,
  });
  await assert.rejects(() => clearFailSigner.clearAssociation(), /404/);

  // --- revoke (synth-015) ---------------------------------------------------
  // revoke issues DELETE /api/v1/signing-wallets/:id and must accept a 204 No Content.
  let revokedUrl = null;
  let revokedMethod = null;
  const revokeFetch = async (url, init) => {
    if (init && init.method === "DELETE") {
      revokedUrl = url;
      revokedMethod = init.method;
      return { ok: true, status: 204, text: async () => "" };
    }
    return { ok: true, status: 200, text: async () => walletInfo() };
  };
  const revokeSigner = await ForgeRemoteSigner.create({
    backendUrl: "http://localhost",
    apiKey: "forge_sk_test",
    walletId: WALLET_ID,
    fetchFn: revokeFetch,
    allowInsecureHttp: true,
  });
  await revokeSigner.revoke();
  assert.equal(revokedMethod, "DELETE", "revoke must use the DELETE method");
  assert.equal(
    revokedUrl,
    `http://localhost/api/v1/signing-wallets/${WALLET_ID}`,
    "revoke must DELETE the wallet's path",
  );

  // A non-2xx revoke response must reject.
  const revokeFailFetch = async (url, init) => {
    if (init && init.method === "DELETE") {
      return { ok: false, status: 404, text: async () => "not found" };
    }
    return { ok: true, status: 200, text: async () => walletInfo() };
  };
  const revokeFailSigner = await ForgeRemoteSigner.create({
    backendUrl: "http://localhost",
    apiKey: "forge_sk_test",
    walletId: WALLET_ID,
    fetchFn: revokeFailFetch,
    allowInsecureHttp: true,
  });
  await assert.rejects(() => revokeFailSigner.revoke(), /404/);

  // A well-formed backend address that decodes to different bytes than the pubkey-derived
  // one is a routing/security concern and must be rejected as a mismatch.
  const otherAddress = toBech32(
    "allo",
    rawSecp256k1PubkeyToRawAddress(
      Secp256k1.compressPubkey(
        (await Secp256k1.makeKeypair(fromHex("bb".repeat(32)))).pubkey,
      ),
    ),
  );
  const badFetch = async () => ({
    ok: true,
    status: 200,
    text: async () =>
      JSON.stringify({
        id: WALLET_ID,
        address: otherAddress,
        pubkey: toHex(pubkey),
      }),
  });
  await assert.rejects(
    () =>
      ForgeRemoteSigner.create({
        backendUrl: "http://localhost",
        apiKey: "k",
        walletId: WALLET_ID,
        fetchFn: badFetch,
        allowInsecureHttp: true,
      }),
    /does not match pubkey-derived address/,
  );

  // A malformed (non-bech32) backend address is a backend data-quality bug and must surface
  // a distinct "not valid bech32" error rather than the mismatch diagnostic (synth-009).
  const badBech32Fetch = async () => ({
    ok: true,
    status: 200,
    text: async () =>
      JSON.stringify({
        id: WALLET_ID,
        address: "allo1wrong",
        pubkey: toHex(pubkey),
      }),
  });
  await assert.rejects(
    () =>
      ForgeRemoteSigner.create({
        backendUrl: "http://localhost",
        apiKey: "k",
        walletId: WALLET_ID,
        fetchFn: badBech32Fetch,
        allowInsecureHttp: true,
      }),
    /not valid bech32/,
  );

  // --- Negative paths -------------------------------------------------------

  const okJson = (obj) => ({
    ok: true,
    status: 200,
    text: async () => JSON.stringify(obj),
  });
  const createWith = (walletFetch, apiKey = "k") =>
    ForgeRemoteSigner.create({
      backendUrl: "http://localhost",
      apiKey,
      walletId: WALLET_ID,
      fetchFn: walletFetch,
      allowInsecureHttp: true,
    });

  // --- masterGranter discovery (synth-003) ----------------------------------
  // The signer surfaces the backend's snake_case `master_granter` wire key as
  // signer.masterGranter, so a caller can do
  //   fee.granter = signer.masterGranter ?? process.env.FORGE_MASTER_GRANTER_ADDRESS
  // It is undefined when the backend advertises none (the main signer's GET omits it).
  assert.equal(
    signer.masterGranter,
    undefined,
    "masterGranter is undefined when the backend advertises none",
  );
  const granterAddress = toBech32(
    "allo",
    rawSecp256k1PubkeyToRawAddress(
      Secp256k1.compressPubkey(
        (await Secp256k1.makeKeypair(fromHex("cc".repeat(32)))).pubkey,
      ),
    ),
  );
  const granterSigner = await createWith(async () =>
    okJson({
      id: WALLET_ID,
      address,
      pubkey: toHex(pubkey),
      master_granter: granterAddress,
    }),
  );
  assert.equal(
    granterSigner.masterGranter,
    granterAddress,
    "masterGranter is discovered from the backend's master_granter field",
  );
  // A malformed master_granter (synth-004) must not be surfaced verbatim: an attacker-
  // controlled / garbage value degrades to undefined rather than reaching fee.granter.
  const badGranterSigner = await createWith(async () =>
    okJson({
      id: WALLET_ID,
      address,
      pubkey: toHex(pubkey),
      master_granter: "not-a-bech32-address",
    }),
  );
  assert.equal(
    badGranterSigner.masterGranter,
    undefined,
    "an invalid master_granter is dropped, not surfaced verbatim",
  );

  // A non-HTTPS backend is rejected unless allowInsecureHttp is set.
  await assert.rejects(
    () =>
      ForgeRemoteSigner.create({
        backendUrl: "http://localhost",
        apiKey: "k",
        walletId: WALLET_ID,
        fetchFn,
      }),
    /must use https/,
  );

  // allowInsecureHttp only relaxes the https requirement for loopback hosts: a public
  // http endpoint must still be rejected so the API key never travels in cleartext.
  await assert.rejects(
    () =>
      ForgeRemoteSigner.create({
        backendUrl: "http://forge.test",
        apiKey: "k",
        walletId: WALLET_ID,
        fetchFn,
        allowInsecureHttp: true,
      }),
    /must use https/,
  );

  // Embedded userinfo must be rejected: fetch would send it as Basic Auth on every
  // request alongside the API key and leak it into error strings/operator logs.
  await assert.rejects(
    () =>
      ForgeRemoteSigner.create({
        backendUrl: "https://user:pass@forge.allora.network",
        apiKey: "k",
        walletId: WALLET_ID,
        fetchFn,
      }),
    /embedded userinfo/,
  );

  // A query string or fragment would corrupt every request path and must be rejected.
  await assert.rejects(
    () =>
      ForgeRemoteSigner.create({
        backendUrl: "https://forge.allora.network/?token=abc",
        apiKey: "k",
        walletId: WALLET_ID,
        fetchFn,
      }),
    /query string or fragment/,
  );
  await assert.rejects(
    () =>
      ForgeRemoteSigner.create({
        backendUrl: "https://forge.allora.network/#frag",
        apiKey: "k",
        walletId: WALLET_ID,
        fetchFn,
      }),
    /query string or fragment/,
  );

  // walletId must be a UUID: a misconfig like "undefined" or "TODO" fails fast at
  // construction instead of surfacing as an opaque backend 404. Parity with Go.
  await assert.rejects(
    () =>
      ForgeRemoteSigner.create({
        backendUrl: "http://localhost",
        apiKey: "k",
        walletId: "not-a-uuid",
        fetchFn,
        allowInsecureHttp: true,
      }),
    /walletId must be a UUID/,
  );

  // timeoutMs must be a positive finite number: 0, a negative value, or NaN are forwarded
  // to setTimeout and would abort every request on the next tick. Rejected at construction.
  for (const badTimeout of [0, -1, Number.NaN]) {
    await assert.rejects(
      () =>
        ForgeRemoteSigner.create({
          backendUrl: "http://localhost",
          apiKey: "k",
          walletId: WALLET_ID,
          fetchFn,
          allowInsecureHttp: true,
          timeoutMs: badTimeout,
        }),
      /timeoutMs must be a positive finite number/,
    );
  }

  // A timeoutMs above setTimeout's 32-bit max delay (2^31-1) overflows and fires almost
  // immediately, so a large finite value must be rejected rather than silently degrading a
  // long timeout to an instant abort.
  await assert.rejects(
    () =>
      ForgeRemoteSigner.create({
        backendUrl: "http://localhost",
        apiKey: "k",
        walletId: WALLET_ID,
        fetchFn,
        allowInsecureHttp: true,
        timeoutMs: 2_147_483_648, // 2^31, one past setTimeout's max delay
      }),
    /must not exceed/,
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
        okJson({ id: WALLET_ID, address: "", pubkey: toHex(pubkey) }),
      ),
    /missing 'address'/,
  );

  // An absent pubkey fails with Forge context.
  await assert.rejects(
    () => createWith(async () => okJson({ id: WALLET_ID, address })),
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

  // An oversized streaming body is rejected by the size cap *while* it is being read,
  // not buffered whole first: the reader yields 0.5 MiB chunks past the 1 MiB cap and
  // must be cancelled with an "exceeded" error before the whole 2 MiB is collected.
  const oversizedBody = () => {
    const chunk = new Uint8Array(512 * 1024); // 0.5 MiB
    let sent = 0;
    let cancelled = false;
    return {
      getReader() {
        return {
          read: async () => {
            if (cancelled || sent >= 4) return { done: true }; // 4 * 0.5 = 2 MiB
            sent++;
            return { done: false, value: chunk };
          },
          cancel: async () => {
            cancelled = true;
          },
        };
      },
    };
  };
  await assert.rejects(
    () =>
      createWith(async () => ({
        ok: true,
        status: 200,
        body: oversizedBody(),
        text: async () => "{}",
      })),
    /response exceeded \d+ bytes/,
  );

  // The X-Forge-API-Key header is actually sent on requests.
  let sentApiKey;
  await createWith(async (_url, init) => {
    sentApiKey = init && init.headers && init.headers["X-Forge-API-Key"];
    return okJson({ id: WALLET_ID, address, pubkey: toHex(pubkey) });
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
      : okJson({ id: WALLET_ID, address, pubkey: toHex(pubkey) }),
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
    return okJson({ id: WALLET_ID, address, pubkey: toHex(pubkey) });
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
    return okJson({ id: WALLET_ID, address, pubkey: toHex(pubkey) });
  });
  await assert.rejects(
    () => corruptSigner.signDirect(address, signDoc),
    /failed local verification/,
  );

  // A high-S (non-canonical) signature is the malleated twin (r, n-s) of a valid one. It
  // still verifies under cosmjs (which is called with lowS:false), so it passes the echo,
  // length, and verify checks — but the SDK's explicit BIP-62 low-S enforcement must
  // reject it, matching the Go/Python siblings.
  const SECP256K1_N = BigInt(
    "0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141",
  );
  const highSSigner = await createWith(async (_url, init) => {
    if (init && init.method === "POST") {
      const body = JSON.parse(init.body);
      const sig = await Secp256k1.createSignature(
        sha256(fromHex(body.payload)),
        privkey,
      );
      const fixed = sig.toFixedLength(); // r(32) || s(32) || recovery(1), low-S
      const sHigh = (SECP256K1_N - BigInt("0x" + toHex(fixed.slice(32, 64))))
        .toString(16)
        .padStart(64, "0");
      const sig64 = new Uint8Array(64);
      sig64.set(fixed.slice(0, 32), 0);
      sig64.set(fromHex(sHigh), 32);
      return okJson({ signature: toHex(sig64), pubkey: toHex(pubkey) });
    }
    return okJson({ id: WALLET_ID, address, pubkey: toHex(pubkey) });
  });
  await assert.rejects(() => highSSigner.signDirect(address, signDoc), /low-S/);

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
    return okJson({ id: WALLET_ID, address, pubkey: toHex(pubkey) });
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

  // provisionForTopic happy path (ENGN-8456 headline feature): POST /api/v1/signing-wallets
  // with {topic_id, label?} returns wallet-info, fromInfo() cross-checks it, and the
  // resulting signer produces a verifiable signature. Exercise both the label-present and
  // label-absent branches since provision() emits a different JSON body for each — a
  // regression in the endpoint URL, the topic_id field name, or the optional label branch
  // would otherwise pass CI undetected.
  for (const label of ["worker-eth-8h", undefined]) {
    let provisionPath = null;
    let provisionBody = null;
    const provisionFetch = async (url, init) => {
      if (init && init.method === "POST" && url.endsWith("/sign")) {
        const reqBody = JSON.parse(init.body);
        const payload = fromHex(reqBody.payload);
        const digest = reqBody.prehashed ? payload : sha256(payload);
        const sig = await Secp256k1.createSignature(digest, privkey);
        const sig64 = sig.toFixedLength().slice(0, 64);
        return {
          ok: true,
          status: 200,
          text: async () =>
            JSON.stringify({ signature: toHex(sig64), pubkey: toHex(pubkey) }),
        };
      }
      // The provision call: POST /api/v1/signing-wallets (no /:id suffix).
      provisionPath = url;
      provisionBody = JSON.parse(init.body);
      return {
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({ id: WALLET_ID, address, pubkey: toHex(pubkey) }),
      };
    };
    const provisionSigner = await ForgeRemoteSigner.provisionForTopic(
      {
        backendUrl: "http://localhost",
        apiKey: "k",
        fetchFn: provisionFetch,
        allowInsecureHttp: true,
      },
      42,
      label,
    );
    assert.ok(
      provisionPath.endsWith("/api/v1/signing-wallets"),
      "provision must POST to /api/v1/signing-wallets",
    );
    assert.equal(provisionBody.topic_id, 42, "provision body carries topic_id");
    if (label === undefined) {
      assert.ok(
        !("label" in provisionBody),
        "label is omitted from the provision body when not provided",
      );
    } else {
      assert.equal(provisionBody.label, label, "provision body carries label");
    }
    assert.equal(
      provisionSigner.address,
      address,
      "provisioned signer address matches the backend wallet",
    );
    const provDoc = {
      bodyBytes: Uint8Array.from([9, 8, 7]),
      authInfoBytes: Uint8Array.from([6, 5, 4]),
      chainId: "allora-testnet-1",
      accountNumber: BigInt(11),
    };
    const provResp = await provisionSigner.signDirect(address, provDoc);
    const provSig = fromBase64(provResp.signature.signature);
    assert.ok(
      await Secp256k1.verifySignature(
        new Secp256k1Signature(provSig.slice(0, 32), provSig.slice(32, 64)),
        sha256(makeSignBytes(provDoc)),
        keypair.pubkey,
      ),
      "provisionForTopic signer signDirect must verify against the wallet pubkey",
    );
  }

  // provisionForTopic must reject a topicId above the JS safe-integer ceiling: a uint64
  // topic ID beyond 2^53-1 loses precision before JSON.stringify and would bind the
  // worker to the wrong topic. Rejected locally, before any backend call.
  await assert.rejects(
    () =>
      ForgeRemoteSigner.provisionForTopic(
        {
          backendUrl: "http://localhost",
          apiKey: "k",
          fetchFn,
          allowInsecureHttp: true,
        },
        Number.MAX_SAFE_INTEGER + 1,
      ),
    /safe integer/,
  );

  console.log(
    "OK: ForgeRemoteSigner positive + negative signing checks passed",
  );
}

main().catch((err) => {
  console.error("FAIL:", err && err.message ? err.message : err);
  process.exit(1);
});
