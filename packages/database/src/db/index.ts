import mongoose from "mongoose";

import {
  type UserDocument,
  type UserModel,
  UserSchema,
  type CredentialDocument,
  type CredentialModel,
  CredentialSchema,
  type SessionDocument,
  type SessionModel,
  SessionSchema,
  AAGUIDSchema,
  type AAGUIDModel,
  type AAGUIDDocument,
} from "../schemas";

export class Db {
  private static instances: { [key: string]: Db } = {};
  public readonly db: mongoose.Connection;
  public readonly models: Model;

  private constructor(url: string) {
    this.db = mongoose.createConnection(url);
    this.models = new Model(this.db);
  }

  public static async getInstance(url: string): Promise<Db> {
    if (!Db.instances[url]) {
      Db.instances[url] = new Db(url);
      await Db.instances[url].db.asPromise();
      const user = url.split("@")[0].split("//")[1].split(":")[0];
      const host = url.split("@")[1].split("/")[0].split(":")[0];
      console.log(`[Mongo] - ${user}@${host} connected`);
      return Db.instances[url];
    }
    return Db.instances[url];
  }

  public static getInstances(): void {
    console.log(Db.instances);
  }
}

class Model {
  private db: mongoose.Connection;
  public User: UserModel;
  public Credential: CredentialModel;
  public Session: SessionModel;
  public AAGUID: AAGUIDModel;

  constructor(db: mongoose.Connection) {
    this.db = db;
    this.User = this.db.model<UserDocument, UserModel>("User", UserSchema);
    this.Credential = this.db.model<CredentialDocument, CredentialModel>(
      "Credential",
      CredentialSchema,
    );
    this.Session = this.db.model<SessionDocument, SessionModel>(
      "Session",
      SessionSchema,
    );
    this.AAGUID = this.db.model<AAGUIDDocument, AAGUIDModel>(
      "AAGUID",
      AAGUIDSchema,
    );
  }
}
