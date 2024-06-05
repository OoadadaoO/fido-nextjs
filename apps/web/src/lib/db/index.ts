import { privateEnv } from "@/lib/env/private";
import { Db } from "@fido/database";

const dbInstance = await Db.getInstance(privateEnv.MONGO_URL);
const db = dbInstance.db;
const User = dbInstance.models.User;
const Credential = dbInstance.models.Credential;
const Session = dbInstance.models.Session;
const AAGUID = dbInstance.models.AAGUID;

export { db, User, Credential, Session, AAGUID };
