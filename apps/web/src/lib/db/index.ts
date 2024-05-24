// import type mongoose from "mongoose";
import { privateEnv } from "@/lib/env/private";
import { Db } from "@fido/database";

// import type { Schema } from "@fido/database";

// declare const global: typeof globalThis & {
//   _db: mongoose.Connection;
//   _User: Schema.UserModel;
//   _Credential: Schema.CredentialModel;
//   _Session: Schema.SessionModel;
// };

// let db: mongoose.Connection;
// let User: Schema.UserModel;
// let Credential: Schema.CredentialModel;
// let Session: Schema.SessionModel;

// if (privateEnv.NODE_ENV === "development") {
//   if (!global._db) {
//     const dbInstance = await Db.getInstance(privateEnv.MONGO_URL);
//     global._db = dbInstance.db;
//     global._User = dbInstance.models.User;
//     global._Credential = dbInstance.models.Credential;
//     global._Session = dbInstance.models.Session;
//   }
//   db = global._db;
//   User = global._User;
//   Credential = global._Credential;
//   Session = global._Session;
// } else {
//   const dbInstance = await Db.getInstance(privateEnv.MONGO_URL);
//   db = dbInstance.db;
//   User = dbInstance.models.User;
//   Credential = dbInstance.models.Credential;
//   Session = dbInstance.models.Session;
// }

const dbInstance = await Db.getInstance(privateEnv.MONGO_URL);
const db = dbInstance.db;
const User = dbInstance.models.User;
const Credential = dbInstance.models.Credential;
const Session = dbInstance.models.Session;

export { db, User, Credential, Session };
