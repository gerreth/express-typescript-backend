import { Request, Response } from "express";

const top = async (request: Request, response: Response) => {
  const {
    params: { user },
    spotifyService
  } = request;
  // get top bands for user from cache or api
  const topBands = await spotifyService.getTopBands(user);

  response.send(topBands);
};

const similar = async (request: Request, response: Response) => {
  const {
    body: { ids },
    spotifyService
  } = request;
  // get similar bands from cache or api
  const similarBands = await spotifyService.getSimilar(ids);

  return response.send(similarBands);
};

export default {
  similar,
  top
};
