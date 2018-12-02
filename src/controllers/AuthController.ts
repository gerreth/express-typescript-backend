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
  console.log({ id });
  let user = await userService().findOrCreate(id, token, request_time);
  console.log({ user });
  // check if token has expired
  if (user.spotify.expires_at < request_time) {
    // refresh token
    console.log({ token });
    const newToken = await spotifyAuthService().getRefreshToken(
      token.refresh_token
    );
    // update user
    console.log({ user });
    user = userService().updateUser(user, newToken, request_time);
  }
  //
  return response.send(user.spotify.access_token);
};

export default {
  auth
};
