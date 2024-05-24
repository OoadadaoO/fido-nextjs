import mongoose from "mongoose";

import type { UserType } from "../types/db";

export interface UserDocument extends Omit<UserType, "id">, mongoose.Document {}
export interface UserModel extends mongoose.Model<UserDocument> {}
export const UserSchema = new mongoose.Schema<UserDocument>(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    username: { type: String, required: true },
    permission: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
    toJSON: {
      transform: (_, ret): void => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
      },
    },
  },
);
