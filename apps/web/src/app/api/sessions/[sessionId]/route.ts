import { NextResponse, type NextRequest } from "next/server";

import { lAuth } from "@/lib/auth";
import { Session } from "@/lib/db";

export async function POST(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      sessionId: string;
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

    const session = await Session.findById(params.sessionId).exec();
    console.log(session);
    if (!session || session.userId.toString() !== token.sub) {
      return NextResponse.json(
        { error: { code: 0, message: "Unauthorized" } },
        { status: 401 },
      );
    }

    await Session.findByIdAndDelete(params.sessionId).exec();

    return NextResponse.json({ data: { success: true } }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: { code: 0, message: "Internal server error" } },
      { status: 500 },
    );
  }
}
