import axios from "axios";
import { Request, Response, NextFunction } from "express";
// project imports
import { redisService } from "../clients/redis";
import { merge, removeDuplicates } from "../utils/array";
import { asyncAwaitMap } from "../utils/async";

/*
 * types
 */
export type SpotifyBand = {
  external_urls: { spotify: string };
  followers: { href?: string; total: number };
  genres: string[];
  href: string;
  id: string;
  images: { height: number; url: string; width: number };
  name: string;
  popularity: number;
  type: string;
  uri: string; // could be more specific
};

export type SpotifyService = (
  token: string
) => {
  getSimilar: (ids: string[]) => Promise<SpotifyBand[]>;
  getTopBands: (user: string) => Promise<SpotifyBand[]>;
};

type getBands = (
  url: string,
  key: string,
  responseKey: string
) => Promise<SpotifyBand[]>;

type getCacheOrApi = (
  url: string,
  responseKey: string,
  identifier?: string
) => Promise<SpotifyBand[]>;

type RemoveDuplicateBands = (
  ids: string[],
  bands: SpotifyBand[]
) => SpotifyBand[];

/*
 * SpotifyService
 */
const spotifyService: SpotifyService = token => {
  const baseUrl = "https://api.spotify.com/v1";
  const axiosInstance = axios.create({
    headers: {
      Authorization: "Bearer " + token,
      "content-type": "application/json"
    }
  });

  /**
   * Get
   * */
  const getBands: getBands = async (url, key, responseKey) => {
    let bands;
    try {
      const result = await axiosInstance.get(url);
      bands = result.data[responseKey];
    } catch (error) {
    } finally {
      redisService().setExpire(key, bands, 24 * 3600);
    }
    return bands;
  };

  /**
   * Find request in the cache, else retrieve from spotify.
   * */
  const getCacheOrApi: getCacheOrApi = async (url, responseKey, identifier) => {
    const key = `${identifier ? identifier + ":" : ""}${url}`;
    let bands = await redisService().get(key);
    if (bands !== null) return bands;
    return getBands(url, key, responseKey);
  };

  /**
   * Removes duplicate bands and those which are in the top50 for the user.
   * */
  const removeDuplicateBands: RemoveDuplicateBands = (ids, bands) => {
    return removeDuplicates(bands, "id").filter(
      band => ids.indexOf(band.id) === -1
    );
  };

  return {
    async getSimilar(ids) {
      const raw = await asyncAwaitMap(ids, (id: string) => {
        const url = `${baseUrl}/artists/${id}/related-artists`;

        return getCacheOrApi(url, "artists");
      });

      const merged = merge(raw);

      return removeDuplicateBands(ids, merged);
    },

    async getTopBands(user) {
      const url = `${baseUrl}/me/top/artists`;

      return getCacheOrApi(url, "items", user);
    }
  };
};

const initSpotifyService = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  request.spotifyService = spotifyService(request.query.token);
  next();
};

export default initSpotifyService;
