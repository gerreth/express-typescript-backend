import { Request, Response } from "express";

const top = async (request: Request, response: Response) => {
  const {
    params: { user },
    spotifyService
  } = request;
  // get top bands for user from cache or api
  const topBands = await spotifyService.getTopBands(user);

  return response.send(topBands);
};

const similar = async (request: Request, response: Response) => {
  const {
    body: { ids },
    spotifyService
  } = request;
  // get similar bands from cache or api
  const similarBands = await spotifyService.getSimilar(ids);
  // search in likes/dislikes

  return response.send(similarBands);
};

const play = async (request: Request, response: Response) => {
  const {
    params: { uri },
    spotifyService
  } = request;

  try {
    const result = await spotifyService.play(uri);
    return response.send(true);
  } catch (error) {
    console.log({ error: error.response.data });
    return response.send(false);
  }
};

const next = async (request: Request, response: Response) => {
  const { spotifyService } = request;

  try {
    const result = await spotifyService.next();
    return response.send(true);
  } catch (error) {
    console.log({ error: error.response.data });
    return response.send(false);
  }
};

export default {
  next,
  play,
  similar,
  top
};
