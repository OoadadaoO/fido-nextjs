import { cookies } from "next/headers";

import { Session as SessionModel } from "@/lib/db";
import type {
  CredentialDocument,
  UserDocument,
} from "@fido/database/src/schemas";

import type { Identifier } from "../utils/device";

import { sessionToken } from "./config";
import { decrypt, encrypt } from "./jwtCrypto";
import type { Session, Token } from "./types";

const { expDiff, extDiff, cookieName, cookieOptions } = sessionToken;

/**
 * for server side rendering & route handler (api)
 */
export async function auth(identifier?: Identifier): Promise<Session> {
  /* For production */
  // get jwt/token from cookie
  const { jwt, token } = await getToken();
  if (!token || !jwt) return { message: "Invalid token" };

  // // refresh jwt
  // const jwt = await encrypt(token);
  // if (!jwt) return null;

  // create session
  const session = await getSession({ token, identifier });
  return typeof session === "string" ? { message: session } : session;

  /* For testing */
  // identifier;
  // return {
  //   user: { id: "1", username: "adada", permission: 0 },
  //   expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
  // };
}

type LoginParams = {
  userId: string;
  credentialId: string;
  identifier: Identifier;
};

export async function login(params: LoginParams) {
  try {
    const issuedAt = new Date();
    const expireAt = new Date(issuedAt.getTime() + expDiff);
    // Database - Create session
    const session = await SessionModel.create({
      userId: params.userId,
      credentialId: params.credentialId,
      identifier: { ...params.identifier, activeAt: issuedAt },
      expireAt: expireAt,
    });

    // refresh token
    const jwt = await encrypt({ sub: session.id }, issuedAt);
    cookies().set(cookieName, jwt, {
      expires: expireAt,
      ...cookieOptions,
    });
  } catch (error) {
    console.error(error);
    return;
  }
}

export async function logout() {
  // get jwt/token from cookie
  const { token } = await getToken();
  if (!token) return;

  // remove jwt from cookie
  cookies().delete(cookieName);

  // remove session
  const { sub } = token;
  await SessionModel.findByIdAndDelete(sub).exec();
}

async function getToken() {
  const jwt = cookies().get(cookieName)?.value;
  if (!jwt) return { jwt: null, token: null };
  const token = await decrypt(jwt);
  if (!token || !token.sub) return { jwt: null, token: null };
  return { jwt, token };
}

type SessionPopulate = {
  user: UserDocument;
  credential: CredentialDocument;
};

export async function getSession({
  token,
  identifier,
}: {
  token: Token;
  identifier?: Identifier;
}): Promise<Session | string> {
  const { sub, iat } = token;

  const existedSession = await SessionModel.findById(sub).exec();
  if (!existedSession) return "Session out of date";

  // update session
  const updatedSession = await SessionModel.findByIdAndUpdate(
    sub,
    {
      identifier: {
        ...existedSession.identifier,
        ...identifier,
        activeAt: new Date(iat * 1000),
      },
      expireAt: laterDate(
        existedSession.expireAt,
        new Date(iat * 1000 + extDiff),
      ),
    },
    { new: true },
  )
    .populate<SessionPopulate>("user credential")
    .exec();
  if (!updatedSession) return "Session update failed";

  return {
    user: {
      id: updatedSession.user.id,
      username: updatedSession.user.username,
      permission: updatedSession.user.permission,
    },
    expires: updatedSession.expireAt,
  };
}

function laterDate(date1: Date, date2: Date) {
  return date1.getTime() > date2.getTime() ? date1 : date2;
}
