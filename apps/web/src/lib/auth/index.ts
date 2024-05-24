import { Types } from "mongoose";

import { base64Url } from "../utils/base64Url";

export function generateAuth() {
  const id = new Types.ObjectId().toHexString();
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  const challenge = base64Url.encode(randomBytes);
  return `${id}.${challenge}`;
}
