/**
 * refer to https://github.com/MasterKale/SimpleWebAuthn
 *
 * @deprecate replaced by the original package @simplewebauthn/server
 */
import crypto from "crypto";

import { ECDSASigValue } from "@peculiar/asn1-ecc";
import { AsnParser } from "@peculiar/asn1-schema";

import { base64Url } from "../utils/base64Url";

export type SubtleCryptoAlg = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";
export type SubtleCryptoCrv = "P-256" | "P-384" | "P-521" | "Ed25519";
export type SubtleCryptoKeyAlgName =
  | "ECDSA"
  | "Ed25519"
  | "RSASSA-PKCS1-v1_5"
  | "RSA-PSS";

export enum COSEKEYS {
  kty = 1,
  alg = 3,
  crv = -1,
  x = -2,
  y = -3,
  n = -1,
  e = -2,
}

export enum COSEKTY {
  OKP = 1,
  EC2 = 2,
  RSA = 3,
}

export enum COSECRV {
  P256 = 1,
  P384 = 2,
  P521 = 3,
  ED25519 = 6,
  SECP256K1 = 8,
}

export enum COSEALG {
  ES256 = -7,
  EdDSA = -8,
  ES384 = -35,
  ES512 = -36,
  PS256 = -37,
  PS384 = -38,
  PS512 = -39,
  ES256K = -47,
  RS256 = -257,
  RS384 = -258,
  RS512 = -259,
  RS1 = -65535,
}

export type COSEPublicKeyEC2 = {
  // Getters
  get(key: COSEKEYS.kty): COSEKTY | undefined;
  get(key: COSEKEYS.alg): COSEALG | undefined;
  get(key: COSEKEYS.crv): number | undefined;
  get(key: COSEKEYS.x): Uint8Array | undefined;
  get(key: COSEKEYS.y): Uint8Array | undefined;
  // Setters
  set(key: COSEKEYS.kty, value: COSEKTY): void;
  set(key: COSEKEYS.alg, value: COSEALG): void;
  set(key: COSEKEYS.crv, value: number): void;
  set(key: COSEKEYS.x, value: Uint8Array): void;
  set(key: COSEKEYS.y, value: Uint8Array): void;
};

export async function verifyEC2(opts: {
  cosePublicKey: COSEPublicKeyEC2;
  signature: Uint8Array;
  data: Uint8Array;
  shaHashOverride?: COSEALG;
}): Promise<boolean> {
  const { cosePublicKey, signature, data, shaHashOverride } = opts;

  const unwrappedSignature = unwrapEC2Signature(signature);

  // Import the public key
  const alg = cosePublicKey.get(COSEKEYS.alg);
  const crv = cosePublicKey.get(COSEKEYS.crv);
  const x = cosePublicKey.get(COSEKEYS.x);
  const y = cosePublicKey.get(COSEKEYS.y);

  if (!alg) {
    throw new Error("Public key was missing alg (EC2)");
  }

  if (!crv) {
    throw new Error("Public key was missing crv (EC2)");
  }

  if (!x) {
    throw new Error("Public key was missing x (EC2)");
  }

  if (!y) {
    throw new Error("Public key was missing y (EC2)");
  }

  let _crv: SubtleCryptoCrv;
  if (crv === COSECRV.P256) {
    _crv = "P-256";
  } else if (crv === COSECRV.P384) {
    _crv = "P-384";
  } else if (crv === COSECRV.P521) {
    _crv = "P-521";
  } else {
    throw new Error(`Unexpected COSE crv value of ${crv} (EC2)`);
  }

  const keyData: JsonWebKey = {
    kty: "EC",
    crv: _crv,
    x: base64Url.encode(x),
    y: base64Url.encode(y),
    ext: false,
  };

  const keyAlgorithm: EcKeyImportParams = {
    /**
     * Note to future self: you can't use `mapCoseAlgToWebCryptoKeyAlgName()` here because some
     * leaf certs from actual devices specified an RSA SHA value for `alg` (e.g. `-257`) which
     * would then map here to `'RSASSA-PKCS1-v1_5'`. We always want `'ECDSA'` here so we'll
     * hard-code this.
     */
    name: "ECDSA",
    namedCurve: _crv,
  };

  const key = await crypto.subtle.importKey(
    "jwk",
    keyData,
    keyAlgorithm,
    false,
    ["verify"],
  );

  // Determine which SHA algorithm to use for signature verification
  let subtleAlg = mapCoseAlgToWebCryptoAlg(alg);
  if (shaHashOverride) {
    subtleAlg = mapCoseAlgToWebCryptoAlg(shaHashOverride);
  }

  const verifyAlgorithm: EcdsaParams = {
    name: "ECDSA",
    hash: { name: subtleAlg },
  };

  return crypto.subtle.verify(verifyAlgorithm, key, unwrappedSignature, data);
}

function unwrapEC2Signature(signature: Uint8Array): Uint8Array {
  function shouldRemoveLeadingZero(bytes: Uint8Array): boolean {
    return bytes[0] === 0x0 && (bytes[1] & (1 << 7)) !== 0;
  }

  const parsedSignature = AsnParser.parse(signature, ECDSASigValue);
  let rBytes = new Uint8Array(parsedSignature.r);
  let sBytes = new Uint8Array(parsedSignature.s);

  if (shouldRemoveLeadingZero(rBytes)) {
    rBytes = rBytes.slice(1);
  }

  if (shouldRemoveLeadingZero(sBytes)) {
    sBytes = sBytes.slice(1);
  }

  const finalSignature = unit8ArrayConcat([rBytes, sBytes]);

  return finalSignature;
}

export function unit8ArrayConcat(arrays: Uint8Array[]): Uint8Array {
  let pointer = 0;
  const totalLength = arrays.reduce((prev, curr) => prev + curr.length, 0);

  const toReturn = new Uint8Array(totalLength);

  arrays.forEach((arr) => {
    toReturn.set(arr, pointer);
    pointer += arr.length;
  });

  return toReturn;
}

/**
 * Convert a COSE alg ID into a corresponding string value that WebCrypto APIs expect
 */
function mapCoseAlgToWebCryptoAlg(alg: COSEALG): SubtleCryptoAlg {
  if ([COSEALG.RS1].indexOf(alg) >= 0) {
    return "SHA-1";
  } else if ([COSEALG.ES256, COSEALG.PS256, COSEALG.RS256].indexOf(alg) >= 0) {
    return "SHA-256";
  } else if ([COSEALG.ES384, COSEALG.PS384, COSEALG.RS384].indexOf(alg) >= 0) {
    return "SHA-384";
  } else if (
    [COSEALG.ES512, COSEALG.PS512, COSEALG.RS512, COSEALG.EdDSA].indexOf(alg) >=
    0
  ) {
    return "SHA-512";
  }

  throw new Error(`Could not map COSE alg value of ${alg} to a WebCrypto alg`);
}
