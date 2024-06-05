// import type mongoose from "mongoose";
import { Db } from "@fido/database";

import { env } from "./env";

const dbInstance = await Db.getInstance(env.MONGO_URL);
const db = dbInstance.db;
const AAGUID = dbInstance.models.AAGUID;

export { db, AAGUID };
