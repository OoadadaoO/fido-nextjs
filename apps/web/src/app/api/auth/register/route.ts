import { NextResponse, type NextRequest } from "next/server";

import mongoose from "mongoose";

import { login } from "@/lib/auth";
import { serverAuth } from "@/lib/auth/config";
import {
  Attestation,
  type AttestationValidationData,
} from "@/lib/auth/credentials";
import { attestationJSONSchema } from "@/lib/auth/credentials";
import { Credential, db, User } from "@/lib/db";
import { publicEnv } from "@/lib/env/public";

export async function POST(req: NextRequest) {
  // Get Metadata
  const username = req.nextUrl.searchParams.get("username");
  if (!username) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const identifier = JSON.parse(req.headers.get("x-identifier") || "{}");
  if (!identifier || !identifier.os || !identifier.browser || !identifier.ip) {
    return NextResponse.json({ error: "Invalid header" }, { status: 400 });
  }

  const [id, challenge] = req.cookies
    .get(serverAuth.cookieName)
    ?.value.split(".") || ["", ""];
  if (!id || !challenge) {
    return NextResponse.json({ error: "Invalid cookie" }, { status: 400 });
  }

  const body = await req.json();
  const zBody = attestationJSONSchema.safeParse(body);
  if (!zBody.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  // Validate Attestation & Register User
  const attestationJSON = zBody.data;
  const attestation = new Attestation(attestationJSON);

  const result = await registerUserAtom(
    attestation,
    challenge,
    { id, name: username },
    identifier,
  );

  if (result.error) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }
  return NextResponse.json(result, { status: 200 });
}

async function registerUserAtom(
  attestation: Attestation,
  challenge: string,
  user: { id: string; name: string },
  identifier: { os: string; browser: string; ip: string },
) {
  const dbSession = await db.startSession();
  dbSession.startTransaction();
  try {
    let data: AttestationValidationData;
    try {
      data = await attestation.validate(
        challenge,
        publicEnv.NEXT_PUBLIC_BASE_URL,
        publicEnv.NEXT_PUBLIC_RP_ID,
      );
    } catch (error: any) {
      throw new Error(`*401Invalid attestation`);
    }

    const newUser = await User.create({
      _id: new mongoose.Types.ObjectId(user.id),
      username: user.name,
    });
    const newCredential = await Credential.create({
      credId: data.credId,
      aaguid: data.aaguid,
      counter: data.counter,
      publicKey: data.publicKey,
      ownerId: newUser._id,
    });

    await login({
      userId: newUser.id,
      credentialId: newCredential.id,
      identifier,
    });
    await dbSession.commitTransaction();

    return {};
  } catch (error: any) {
    console.error(error);
    await dbSession.abortTransaction();
    if (error.message.startsWith("*")) {
      return {
        status: parseInt(error.message.slice(1)),
        error: error.message.slice(4),
      };
    }
    return { status: 500, error: "Database error" };
  } finally {
    dbSession.endSession();
  }
}
