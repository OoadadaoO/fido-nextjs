import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { sessionToken } from "@/lib/auth/config";
import type { GetSessionResponse } from "@/lib/types/api/session";

export async function GET(): Promise<NextResponse<GetSessionResponse>> {
  const session = await auth();
  if (!session || !session.user) {
    cookies().delete(sessionToken.cookieName);
    return NextResponse.json(
      { error: { code: 0, message: session.message } },
      { status: 400 },
    );
  }
  return NextResponse.json({ data: session }, { status: 200 });
}
