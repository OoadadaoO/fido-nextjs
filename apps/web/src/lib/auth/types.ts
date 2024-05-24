import type { UserType } from "@fido/database/src/types/db";

export type Session =
  | {
      user: Omit<UserType, "createdAt">;
      expires: Date;
    }
  | {
      user?: never;
      expires?: never;
      message: string;
    };

export type Token = {
  sub: string; // session id
  iat: number; // issued at
};
