import { Request } from "express";
import { SpotifyServiceReturn } from "../services/spotifyService";

declare global {
  export namespace Express {
    export interface Request {
      spotifyService: SpotifyServiceReturn;
    }
  }
}
