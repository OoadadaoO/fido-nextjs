import { NextResponse, type NextRequest } from "next/server";

import { login } from "@/lib/auth";
import { serverCred } from "@/lib/auth/config";
import {
  Assertion,
  type AssertionValidationData,
} from "@/lib/auth/credentials";
import { assertionJSONSchema } from "@/lib/auth/credentials";
import { Credential, db, User } from "@/lib/db";
import { publicEnv } from "@/lib/env/public";

export async function POST(req: NextRequest) {
  // Get Metadata
  const identifier = JSON.parse(req.headers.get("x-identifier") || "{}");
  if (!identifier || !identifier.os || !identifier.browser || !identifier.ip) {
    return NextResponse.json({ error: "Invalid header" }, { status: 400 });
  }

  const [, challenge] = req.cookies
    .get(serverCred.cookieName)
    ?.value.split(".") || ["", ""];
  if (!challenge) {
    return NextResponse.json({ error: "Invalid cookie" }, { status: 400 });
  }

  const body = await req.json();
  const zBody = assertionJSONSchema.safeParse(body);
  if (!zBody.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  // Validate Assertion & Authenticate User
  const assertionJSON = zBody.data;
  const assertion = new Assertion(assertionJSON);

  const result = await authUserAtom(assertion, challenge, identifier);
  if (result.error) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }
  return NextResponse.json(result, { status: 200 });
}

async function authUserAtom(
  assertion: Assertion,
  challenge: string,
  identifier: { os: string; browser: string; ip: string },
) {
  const dbSession = await db.startSession();
  dbSession.startTransaction();
  try {
    const userId = assertion.parseUserHandle();
    const [user, credential] = await Promise.all([
      User.findById(userId).exec(),
      Credential.findOne({
        credId: assertion.credential.id,
        ownerId: userId,
      }).exec(),
    ]);
    if (!user) {
      throw new Error("*404User not found");
    }
    if (!credential) {
      throw new Error("*404Credential not found");
    }

    let data: AssertionValidationData;
    try {
      data = await assertion.validate(
        challenge,
        publicEnv.NEXT_PUBLIC_BASE_URL,
        publicEnv.NEXT_PUBLIC_RP_ID,
        credential.publicKey,
        credential.counter,
      );
    } catch (error: any) {
      console.error(error);
      throw new Error(`*401Invalid assertion`);
    }

    const updatedCredential = await Credential.findByIdAndUpdate(
      credential._id,
      {
        counter: data.counter,
      },
      { new: true },
    ).exec();
    if (!updatedCredential) {
      throw new Error("*500Credential update failed");
    }
    await login({
      userId: user.id,
      credentialId: updatedCredential.id,
      identifier,
    });
    await dbSession.commitTransaction();
    return {};
  } catch (error: any) {
    await dbSession.abortTransaction();
    console.error(error);
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
