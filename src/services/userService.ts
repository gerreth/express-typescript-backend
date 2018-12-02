import { DocumentQuery } from "mongoose";

import User, { IUser } from "../models/user";
import { IGetRefreshTokenResponse } from "./spotifyAuthService";

export type IFindById = (id: string) => DocumentQuery<IUser, IUser, {}>;
export type ILike = (id: string, band: any, flag: string) => void;

export type IFindOrCreate = (
  id: string,
  token: any,
  request_time: number
) => Promise<IUser | DocumentQuery<IUser, IUser, {}>>;

export type IUpdateUser = (
  user: IUser,
  token: IGetRefreshTokenResponse,
  request_time: number
) => IUser;

export type UserService = () => UserServiceReturn;

export type UserServiceReturn = {
  findById: IFindById;
  findOrCreate: IFindOrCreate;
  like: ILike;
  updateUser: IUpdateUser;
};

const userService: UserService = () => {
  const createUser = (id: string, token: any, request_time: number) => {
    const user = new User({
      name: id,
      spotify: {
        access_token: token.access_token,
        refresh_token: token.refresh_token,
        expires_at: 1000 * token.expires_in + request_time
      }
    });

    user.save();

    return user;
  };

  const findById: IFindById = id =>
    User.findOne({ name: id }, (error, user) => user);

  const findOrCreate: IFindOrCreate = async (id, token, request_time) => {
    return (await findById(id)) || (await createUser(id, token, request_time));
  };

  const like: ILike = async (id, band, flag) => {
    const user = await findById(id);
    console.log({ band });

    if (flag === "true") {
      user.bands.likes.push(band.name);
    } else {
      user.bands.dislike.push(band.name);
    }

    user.save();
  };

  const updateUser: IUpdateUser = (user, token, request_time) => {
    user.spotify.access_token = token.access_token;
    user.spotify.expires_at = 1000 * token.expires_in + request_time;
    user.save();

    return user;
  };

  return {
    findById,
    like,
    findOrCreate,
    updateUser
  };
};

export default userService;
