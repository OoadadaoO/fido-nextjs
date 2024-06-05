import type { Session } from "../auth/types";

export function parseSession(data: Session): Session {
  if (data.user) {
    return {
      user: {
        id: data.user.id,
        username: data.user.username,
        permission: data.user.permission,
      },
      expires: new Date(data.expires),
    };
  }
  return data;
}
