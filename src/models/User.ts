import { Document, Schema, Model, model } from "mongoose";

export interface IUser extends Document {
  bands: {
    dislike: Array<any>;
    likes: Array<any>;
    top: Array<any>;
  };
  createdAt: number;
  name: string;
  spotify: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
}

export const UserSchema: Schema = new Schema({
  bands: {
    dislike: Array,
    likes: Array,
    top: Array
  },
  createdAt: Date,
  name: String,
  spotify: {
    access_token: String,
    refresh_token: String,
    expires_at: Number
  }
});

const User: Model<IUser> = model<IUser>("Users", UserSchema);

export default User;
