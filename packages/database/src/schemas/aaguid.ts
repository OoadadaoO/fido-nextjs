import mongoose from "mongoose";

import type { AAGUIDType } from "../types/db";

export interface AAGUIDDocument
  extends Omit<AAGUIDType, "id">,
    mongoose.Document {}
export interface AAGUIDModel extends mongoose.Model<AAGUIDDocument> {}
export const AAGUIDSchema = new mongoose.Schema<AAGUIDDocument>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true },
    icon_dark: { type: String, required: true },
    icon_light: { type: String, required: true },
    official: { type: Boolean, default: false },
    status: { type: [String] },
  },
  {
    versionKey: false,
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret): void => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
      },
    },
  },
);
