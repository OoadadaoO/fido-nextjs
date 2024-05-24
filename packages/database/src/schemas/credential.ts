import mongoose from "mongoose";

import type { CredentialType } from "../types/db";

export interface CredentialDocument
  extends Omit<CredentialType, "id" | "ownerId" | "approverId">,
    mongoose.Document {
  ownerId: mongoose.Types.ObjectId;
  approverId: mongoose.Types.ObjectId;
}
export interface CredentialModel extends mongoose.Model<CredentialDocument> {}
export const CredentialSchema = new mongoose.Schema<CredentialDocument>(
  {
    credId: { type: String, required: true },
    aaguid: { type: String, required: true },
    counter: { type: Number, default: 0 },
    publicKey: { type: String, required: true },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    approverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    createdAt: { type: Date, default: Date.now },
    approvedAt: { type: Date },
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
      owner: {
        options: {
          ref: "User",
          localField: "ownerId",
          foreignField: "_id",
          justOne: true,
        },
      },
      approver: {
        options: {
          ref: "User",
          localField: "approverId",
          foreignField: "_id",
          justOne: true,
        },
      },
    },
  },
);
