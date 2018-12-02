import { Request } from "express";
import { SpotifyServiceReturn } from "../clients/spotify";

declare global {
  export namespace Express {
    export interface Request {
      spotifyService: SpotifyServiceReturn;
    }
  }
}
