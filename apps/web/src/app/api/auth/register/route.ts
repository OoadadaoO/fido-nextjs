import { NextResponse, type NextRequest } from "next/server";

import mongoose from "mongoose";

import { auth, session } from "@/lib/auth/config";
import {
  Attestation,
  type AttestationValidationData,
} from "@/lib/auth/credentials";
import { attestationJSONSchema } from "@/lib/auth/credentials";
import { Credential, db, Session, User } from "@/lib/db";
import { publicEnv } from "@/lib/env/public";

export async function POST(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username");
  if (!username) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  const identifier = JSON.parse(req.headers.get("x-identifier") || "{}");
  if (!identifier || !identifier.os || !identifier.browser || !identifier.ip) {
    return NextResponse.json({ error: "Invalid header" }, { status: 400 });
  }

  const [id, challenge] = req.cookies
    .get(auth.cookieName)
    ?.value.split(".") || ["", ""];
  if (!id || !challenge) {
    return NextResponse.json({ error: "Invalid cookie" }, { status: 400 });
  }

  const body = await req.json();
  const zBody = attestationJSONSchema.safeParse(body);
  if (!zBody.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const attestationJSON = zBody.data;
  const attestation = new Attestation(attestationJSON);
  const data = attestation.validate(
    challenge,
    publicEnv.NEXT_PUBLIC_BASE_URL,
    publicEnv.NEXT_PUBLIC_RP_ID,
  );

  try {
    const { user, credential, session } = await registerUserAtom(
      { id, name: username },
      identifier,
      data,
    );
    return NextResponse.json({ user, credential, session }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function registerUserAtom(
  user: { id: string; name: string },
  identifier: { os: string; browser: string; ip: string },
  data: AttestationValidationData,
) {
  let newUser, newCredential, newSession;

  const dbSession = await db.startSession();
  dbSession.startTransaction();
  try {
    newUser = await User.create({
      _id: new mongoose.Types.ObjectId(user.id),
      username: user.name,
    });
    newCredential = await Credential.create({
      credId: data.credId,
      aaguid: data.aaguid,
      counter: data.counter,
      publicKey: data.publicKey,
      ownerId: newUser._id,
    });
    newSession = await Session.create({
      userId: newUser._id,
      credentialId: newCredential._id,
      identifier: { ...identifier, activeAt: new Date() },
      expireAt: new Date(Date.now() + session.expDiff),
    });
    await dbSession.commitTransaction();

    return { user: newUser, credential: newCredential, session: newSession };
  } catch (err) {
    console.error(err);
    await dbSession.abortTransaction();
    throw new Error("Database error");
  } finally {
    dbSession.endSession();
  }
}
