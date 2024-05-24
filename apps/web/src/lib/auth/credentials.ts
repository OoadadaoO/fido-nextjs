import cbor from "cbor";
import crypto from "crypto";
import { z } from "zod";

import {
  isoCrypto,
  isoUint8Array,
  type COSEPublicKeyEC2,
} from "@simplewebauthn/server/helpers";

import { base64Url } from "../utils/base64Url";

export type CredentialBase = {
  id: string;
  rawId: ArrayBuffer;
  type: PublicKeyCredentialType;
  authenticatorAttachment: AuthenticatorAttachment;
};

export type AttestationObj = CredentialBase & {
  response: {
    attestationObject: ArrayBuffer;
    clientDataJSON: ArrayBuffer;
  };
};

export type AssertionObj = CredentialBase & {
  response: {
    authenticatorData: ArrayBuffer;
    clientDataJSON: ArrayBuffer;
    signature: ArrayBuffer;
    userHandle: ArrayBuffer;
  };
};

export const attestationJSONSchema = z.object({
  id: z.string(),
  rawId: z.string(),
  response: z.object({
    attestationObject: z.string(),
    clientDataJSON: z.string(),
  }),
  type: z.literal("public-key"),
  authenticatorAttachment: z.enum(["platform", "cross-platform"]),
});

export type AttestationJSON = z.infer<typeof attestationJSONSchema>;

export const assertionJSONSchema = z.object({
  id: z.string(),
  rawId: z.string(),
  response: z.object({
    authenticatorData: z.string(),
    clientDataJSON: z.string(),
    signature: z.string(),
    userHandle: z.string(),
  }),
  type: z.literal("public-key"),
  authenticatorAttachment: z.enum(["platform", "cross-platform"]),
});

export type AssertionJSON = z.infer<typeof assertionJSONSchema>;

export type AttestationValidationData = {
  credId: string;
  aaguid: string | undefined;
  counter: number;
  publicKey: string;
};
export type AssertionValidationData = {
  counter: number;
};

export class Attestation {
  credential: AttestationObj;

  constructor(attestationJSON: AttestationJSON) {
    this.credential = {
      id: attestationJSON.id,
      rawId: base64Url.decode(attestationJSON.rawId),
      response: {
        attestationObject: base64Url.decode(
          attestationJSON.response.attestationObject,
        ),
        clientDataJSON: base64Url.decode(
          attestationJSON.response.clientDataJSON,
        ),
      },
      type: attestationJSON.type,
      authenticatorAttachment: attestationJSON.authenticatorAttachment,
    };
  }

  static toJSON(attestation: AttestationObj) {
    return {
      id: attestation.id,
      rawId: base64Url.encode(attestation.rawId),
      response: {
        attestationObject: base64Url.encode(
          attestation.response.attestationObject,
        ),
        clientDataJSON: base64Url.encode(attestation.response.clientDataJSON),
      },
      type: attestation.type,
      authenticatorAttachment: attestation.authenticatorAttachment,
    };
  }

  parseAttestationObject() {
    const attestationObject = cbor.decodeAllSync(
      this.credential.response.attestationObject,
    )[0] as {
      fmt: string;
      authData: Uint8Array;
      attStmt: Record<string, any>;
    };
    const authDataUnit8Array = attestationObject.authData;
    const authData = parseAuthData(
      authDataUnit8Array.buffer.slice(
        authDataUnit8Array.byteOffset,
        authDataUnit8Array.byteOffset + authDataUnit8Array.byteLength,
      ),
    );
    return { ...attestationObject, authData };
  }

  parseClientDataJSON() {
    return JSON.parse(
      new TextDecoder().decode(this.credential.response.clientDataJSON),
    );
  }

  async validate(
    challenge: string,
    origin: string,
    rpId: string,
  ): Promise<AttestationValidationData> {
    const clientData = this.parseClientDataJSON();

    if (clientData.challenge !== challenge)
      throw new Error("Invalid challenge!");
    if (clientData.origin !== origin) throw new Error("Invalid origin!");
    if (clientData.type !== "webauthn.create")
      throw new Error("Invalid WebAuthn type!");

    const attestationObject = this.parseAttestationObject();

    if (
      attestationObject.authData.attestationCredData.credId !==
      this.credential.id
    )
      throw new Error("Invalid credential ID!");
    if (!attestationObject.authData.flags.uv)
      throw new Error("User Verification is required!");
    if (
      attestationObject.authData.rpIdHash !==
      crypto.createHash("sha256").update(rpId).digest("base64url")
    ) {
      throw new Error("Invalid RP ID hash!");
    }

    return {
      credId: this.credential.id,
      aaguid: attestationObject.authData.attestationCredData.aaguid,
      counter: attestationObject.authData.counter,
      publicKey: base64Url.encode(
        attestationObject.authData.attestationCredData.cosePublicKeyBuffer!,
      ),
    };
  }
}

export class Assertion {
  credential: AssertionObj;

  constructor(assertionJSON: AssertionJSON) {
    this.credential = {
      id: assertionJSON.id,
      rawId: base64Url.decode(assertionJSON.rawId),
      response: {
        authenticatorData: base64Url.decode(
          assertionJSON.response.authenticatorData,
        ),
        clientDataJSON: base64Url.decode(assertionJSON.response.clientDataJSON),
        signature: base64Url.decode(assertionJSON.response.signature),
        userHandle: base64Url.decode(assertionJSON.response.userHandle),
      },
      type: assertionJSON.type,
      authenticatorAttachment: assertionJSON.authenticatorAttachment,
    };
  }

  static toJSON(assertion: AssertionObj) {
    return {
      id: assertion.id,
      rawId: base64Url.encode(assertion.rawId),
      response: {
        authenticatorData: base64Url.encode(
          assertion.response.authenticatorData,
        ),
        clientDataJSON: base64Url.encode(assertion.response.clientDataJSON),
        signature: base64Url.encode(assertion.response.signature),
        userHandle: base64Url.encode(assertion.response.userHandle),
      },
      type: assertion.type,
      authenticatorAttachment: assertion.authenticatorAttachment,
    };
  }

  parseAuthenticatorData() {
    const authenticatorData = this.credential.response.authenticatorData;
    return parseAuthData(authenticatorData);
  }

  parseClientDataJSON() {
    return JSON.parse(
      new TextDecoder().decode(this.credential.response.clientDataJSON),
    );
  }

  parseUserHandle() {
    return base64Url.encode(this.credential.response.userHandle);
  }

  async validate(
    challenge: string,
    origin: string,
    rpId: string,
    publicKey: string,
    counter: number,
  ) {
    const clientData = this.parseClientDataJSON();

    if (clientData.challenge !== challenge)
      throw new Error("Invalid challenge!");
    if (clientData.origin !== origin) throw new Error("Invalid origin!");
    if (clientData.type !== "webauthn.get")
      throw new Error("Invalid WebAuthn type!");

    const authenticatorData = this.parseAuthenticatorData();

    if (
      authenticatorData.rpIdHash !==
      crypto.createHash("sha256").update(rpId).digest("base64url")
    )
      throw new Error("Invalid RP ID hash!");
    if (!authenticatorData.flags.uv)
      throw new Error("User Verification is required!");
    if (counter !== 0 && authenticatorData.counter <= counter)
      throw new Error("Replay attack detected!");

    const cosePublicKey: COSEPublicKeyEC2 = cbor.decodeAllSync(
      base64Url.decode(publicKey),
    )[0];
    const clientDataHash = crypto
      .createHash("sha256")
      .update(Buffer.from(this.credential.response.clientDataJSON))
      .digest();
    const signatureBase = isoUint8Array.concat([
      new Uint8Array(this.credential.response.authenticatorData),
      clientDataHash,
    ]);
    const isVerified = await isoCrypto.verify({
      cosePublicKey,
      signature: new Uint8Array(this.credential.response.signature),
      data: signatureBase,
    });
    if (!isVerified) throw new Error("Failed to verify signature!");

    return {
      counter: authenticatorData.counter,
    };
  }
}

function parseAuthData(authData: ArrayBuffer) {
  if (authData.byteLength < 37)
    throw new Error("Authenticator Data must be at least 37 bytes long!");

  /* RPID hash */
  const rpIdHash = base64Url.encode(authData.slice(0, 32));
  authData = authData.slice(32);

  /* Flags */
  const flagsInt = new DataView(authData.slice(0, 1)).getUint8(0);
  authData = authData.slice(1);
  const up = !!(flagsInt & 0x01); // Test of User Presence
  const uv = !!(flagsInt & 0x04); // User Verification
  const be = !!(flagsInt & 0x08); // Backup Eligibility
  const bs = !!(flagsInt & 0x10); // Backup State
  const at = !!(flagsInt & 0x40); // Attestation data
  const ed = !!(flagsInt & 0x80); // Extension data
  const flags = { up, uv, be, bs, at, ed, flagsInt };

  /* Counter */
  const counter = new DataView(authData.slice(0, 4)).getUint32(0);
  authData = authData.slice(4);

  let aaguid, credId, cosePublicKeyBuffer, extensionsDataBuffer;
  if (at) {
    /* Attested credential data */
    aaguid = Buffer.from(authData.slice(0, 16)).toString("hex");
    aaguid = `${aaguid.slice(0, 8)}-${aaguid.slice(8, 12)}-${aaguid.slice(12, 16)}-${aaguid.slice(16, 20)}-${aaguid.slice(20, 32)}`;
    authData = authData.slice(16);

    const credIdLen = new DataView(authData.slice(0, 2)).getUint16(0);
    authData = authData.slice(2);

    credId = base64Url.encode(authData.slice(0, credIdLen));
    authData = authData.slice(credIdLen);

    const pubKeyLen = cbor.encodeOne(
      cbor.decodeAllSync(authData)[0],
    ).byteLength;
    cosePublicKeyBuffer = authData.slice(0, pubKeyLen);
    authData = authData.slice(pubKeyLen);

    if (ed) {
      const extensionsDataLen = cbor.encodeOne(
        cbor.decodeAllSync(authData)[0],
      ).byteLength;
      extensionsDataBuffer = authData.slice(0, extensionsDataLen);
      authData = authData.slice(extensionsDataLen);
    }
    if (authData.byteLength)
      throw new Error(
        "Failed to decode authData! Leftover bytes been detected!",
      );
  }

  return {
    rpIdHash,
    counter,
    flags,
    attestationCredData: {
      aaguid,
      credId,
      cosePublicKeyBuffer,
      extensionsDataBuffer,
    },
  };
}
