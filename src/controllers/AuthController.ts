import { Request, Response } from "express";

import spotifyAuthService from "../services/spotifyAuthService";
import spotifyService from "../services/spotifyService";
import userService from "../services/userService";

const auth = async (request: Request, response: Response) => {
  const request_time = Date.now();
  // get code from request
  const { code, redirect_uri } = request.query;
  // exchange code for access_token/refresh_token
  const token = await spotifyAuthService().getToken(code, redirect_uri);
  // get profile
  const { id } = await spotifyService(token.access_token).getProfile();
  // look at db
  let user = await userService().findOrCreate(id, token, request_time);
  // check if token has expired
  if (user.spotify.expires_at < request_time) {
    // refresh token
    const newToken = await spotifyAuthService().getRefreshToken(
      token.refresh_token
    );
    // update user
    user = userService().updateUser(user, newToken, request_time);
  }
  //
  return response.send(user.spotify.access_token);
};

export default {
  auth
};
