import type { ErrorResponse, Response } from ".";

import type { Session } from "@/lib/auth/types";

export type GetSessionResponse = Response<Session> | ErrorResponse;
