import { Request } from "express";
import { SpotifyBand } from "../clients/spotify";

declare global {
  export namespace Express {
    export interface Request {
      spotifyService?: {
        getSimilar: (ids: string[]) => Promise<SpotifyBand[]>;
        getTopBands: (user: string) => Promise<SpotifyBand[]>;
      };
    }
  }
}
