import mongoose, { Schema, model, models, type InferSchemaType } from "mongoose";

const AdminSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export type AdminDoc = InferSchemaType<typeof AdminSchema>;

export const Admin = models.Admin || model("Admin", AdminSchema);
export default Admin as mongoose.Model<AdminDoc>;
