import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { lAuth } from "@/lib/auth";
import { sessionToken } from "@/lib/auth/config";
import { Credential, Session } from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      credentialId: string;
    };
  },
) {
  try {
    // invalid token or session does not exist
    const token = await lAuth();
    if (!token || !token.sub) {
      return NextResponse.json(
        { error: { code: 0, message: "Unauthorized" } },
        { status: 401 },
      );
    }
    if (!(await Session.findById(token.sid).exec())) {
      cookies().delete(sessionToken.cookieName);
      return NextResponse.redirect("/auth/");
    }

    // credential does not belong to user
    const credential = await Credential.findById(params.credentialId).exec();
    if (!credential || credential.ownerId.toString() !== token.sub) {
      return NextResponse.json(
        { error: { code: 0, message: "Unauthorized" } },
        { status: 401 },
      );
    }

    const ownCredentials = await Credential.find(
      { ownerId: token.sub },
      { id: true },
    ).exec();
    if (ownCredentials.length === 1) {
      return NextResponse.json(
        {
          error: { code: 0, message: "You must have at least one credential" },
        },
        { status: 400 },
      );
    }

    await Credential.findByIdAndDelete(params.credentialId).exec();

    return NextResponse.json({ data: { success: true } }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: { code: 0, message: "Internal server error" } },
      { status: 500 },
    );
  }
}
