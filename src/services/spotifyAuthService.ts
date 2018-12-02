import axios from "axios";
import { Request, Response, NextFunction } from "express";

import UserService from "./userService";
import spotifyService from "../services/spotifyService";
// Return types
export type IGetRefreshTokenResponse = {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
};

export type IGetTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
};

// Method types
export type IGetRefreshToken = (
  refresh_token: string
) => Promise<IGetRefreshTokenResponse>;
export type IGetToken = (
  code: string,
  redirect_uri: string
) => Promise<IGetTokenResponse>;

export type spotifyAuthServiceReturn = {
  getRefreshToken: IGetRefreshToken;
  getToken: IGetToken;
};
// Service type
export type spotifyAuthService = () => spotifyAuthServiceReturn;

const spotifyAuthService: spotifyAuthService = () => {
  const client_id = process.env.CLIENT_ID;
  const client_secret = process.env.CLIENT_SECRET;
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization: `Basic ${new Buffer(
      `${client_id}:${client_secret}`
    ).toString("base64")}`
  };
  const options = {
    headers,
    method: "post",
    url: "https://accounts.spotify.com/api/token"
  };

  return {
    async getToken(code, redirect_uri) {
      const grant_type = "authorization_code";

      const response = await axios({
        ...options,
        params: { grant_type, code, redirect_uri }
      });

      return response.data;
    },
    async getRefreshToken(refresh_token) {
      const grant_type = "refresh_token";

      const response = await axios({
        ...options,
        params: { grant_type, refresh_token }
      });

      return response.data;
    }
  };
};

export const refreshStrategy = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const request_time = Date.now();
  // Get user by name
  let user = await UserService().findById(request.params.user);
  // check if token is invalid
  if (user.spotify.expires_at < request_time) {
    // refresh token
    const newToken = await spotifyAuthService().getRefreshToken(
      user.spotify.refresh_token
    );
    // update user
    user = UserService().updateUser(user, newToken, request_time);
  }

  request.spotifyService = spotifyService(user.spotify.access_token);

  next();
};

export default spotifyAuthService;
