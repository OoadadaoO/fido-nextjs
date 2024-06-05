import { NextResponse, type NextRequest } from "next/server";

import { lAuth } from "@/lib/auth";
import { Credential } from "@/lib/db";

export async function POST(
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
    const token = await lAuth();
    console.log(token);
    if (!token || !token.sub) {
      return NextResponse.json(
        { error: { code: 0, message: "Unauthorized" } },
        { status: 401 },
      );
    }

    const credential = await Credential.findById(params.credentialId).exec();
    console.log(credential);
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
