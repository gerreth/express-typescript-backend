import { Request, Response } from "express";

import UserService from "../services/userService";

const me = async (request: Request, response: Response) => {
  const { spotifyService } = request;
  // get profile
  const me = await spotifyService.getProfile();

  return response.send(me);
};

const like = async (request: Request, response: Response) => {
  const {
    body: { band },
    params: { user, like }
  } = request;

  UserService().like(user, band, like);
};

export default {
  like,
  me
};
