import mongoose from "mongoose";

import type { SessionType } from "../types/db";

export interface SessionDocument
  extends Omit<SessionType, "id" | "userId" | "credentialId">,
    mongoose.Document {
  userId: mongoose.Types.ObjectId;
  credentialId: mongoose.Types.ObjectId;
}
export interface SessionModel extends mongoose.Model<SessionDocument> {}
export const SessionSchema = new mongoose.Schema<SessionDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    credentialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Credential",
      required: true,
    },
    identifier: {
      os: { type: String, required: true },
      browser: { type: String, required: true },
      ip: { type: String, required: true },
      activeAt: { type: Date, default: Date.now },
    },
    createdAt: { type: Date, default: Date.now },
    expireAt: { type: Date, expires: 0, required: true },
  },
  {
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_, ret): void => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
      },
    },
    virtuals: {
      user: {
        options: {
          ref: "User",
          localField: "userId",
          foreignField: "_id",
          justOne: true,
        },
      },
      credential: {
        options: {
          ref: "Credential",
          localField: "credentialId",
          foreignField: "_id",
          justOne: true,
        },
      },
    },
  },
);
