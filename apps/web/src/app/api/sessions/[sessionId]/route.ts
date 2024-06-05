import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { lAuth } from "@/lib/auth";
import { sessionToken } from "@/lib/auth/config";
import { Session } from "@/lib/db";

export async function DELETE(
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

    // session does not belong to user
    const session = await Session.findById(params.sessionId).exec();
    if (!session || session.userId.toString() !== token.sub) {
      return NextResponse.json(
        { error: { code: 0, message: "Unauthorized" } },
        { status: 401 },
      );
    }

    await session.deleteOne();

    return NextResponse.json({ data: { success: true } }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: { code: 0, message: "Internal server error" } },
      { status: 500 },
    );
  }
}
