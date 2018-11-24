import { Request, Response } from "express";

import SpotifyService, { SpotifyBand } from "../clients/spotify";

const top = async (request: Request, response: Response) => {
  const { token } = request.query;
  const { user } = request.params;
  // initialize service to fetch bands from cache or api
  const spotifyService = SpotifyService(token);
  // get top bands for user from cache or api
  const topBands = await spotifyService.getTopBands(user);

  response.send(topBands);
};

const similar = async (request: Request, response: Response) => {
  const { token } = request.query;
  const { ids } = request.body;
  // initialize service to fetch bands from cache or api
  const spotifyService = SpotifyService(token);
  // get similar bands from cache or api
  const similarBands = await spotifyService.getSimilar(ids);

  return response.send(similarBands);
};

export default {
  similar,
  top
};
