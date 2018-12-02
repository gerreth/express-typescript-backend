import axios from "axios";
import { Request, Response, NextFunction } from "express";
// project imports
import { redisService, RedisServiceReturn } from "../clients/redis";
import { merge, removeDuplicates } from "../utils/array";
import { asyncAwaitMap } from "../utils/async";
import UserService from "../services/UserService";
import spotifyAuthService from "../services/spotifyAuthService";

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
  uri: string;
};

export type IGetProfileResponse = {
  country: string;
  display_name: string;
  email: string;
  external_urls: { spotify: string };
  followers: { href: null; total: number };
  href: string;
  id: string;
  images: any;
  product: string;
  type: string;
  uri: string;
};

export type SpotifyService = (token: string) => SpotifyServiceReturn;

export type SpotifyServiceReturn = {
  getProfile: () => Promise<IGetProfileResponse>;
  getSimilar: (ids: string[]) => Promise<SpotifyBand[]>;
  getTopBands: (user: string) => Promise<SpotifyBand[]>;
};

type getBands = (url: string, responseKey: string) => Promise<SpotifyBand[]>;

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

  let redis: RedisServiceReturn;

  /**
   * Get
   * */
  const getBands: getBands = async (url, responseKey) => {
    let bands;
    try {
      const result = await axiosInstance.get(url);
      bands = result.data[responseKey];
    } catch (error) {}
    redis.setExpire(bands, 24 * 3600);
    return bands;
  };

  /**
   * Find request in the cache, else retrieve from spotify.
   * */
  const getCacheOrApi: getCacheOrApi = async (url, responseKey, identifier) => {
    redis = redisService(url, identifier);
    let cachedBands = await redis.get();
    return cachedBands || getBands(url, responseKey);
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
      const url = `${baseUrl}/me/top/artists?limit=50`;

      return getCacheOrApi(url, "items", user);
    },

    async getMe(user: string) {
      const url = `${baseUrl}/me`;

      return getCacheOrApi(url, "items", user);
    },

    async getProfile() {
      const response = await axiosInstance.get("https://api.spotify.com/v1/me");

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

export default spotifyService;
