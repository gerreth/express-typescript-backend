import redis from "redis";

import { ISpotifyBand } from "../services/spotifyService";

const host = process.env.REDIS_HOST;
const auth = process.env.REDIS_AUTH;
const port = process.env.REDIS_PORT;

const client = redis.createClient(port, { host });

if (auth !== "") {
  client.auth(auth);
}

client.on("connect", () => {
  console.log(":: Redis client connected with " + host);
});

client.on("error", (error: any) => {
  console.log(":: Something went wrong " + error);
});

export type RedisService = (
  base: string,
  identifier: string
) => RedisServiceReturn;

export type RedisServiceReturn = {
  get: () => Promise<ISpotifyBand[]>;
  setExpire: (data: any, time: number) => void;
  del: () => void;
  incr: () => void;
  client: any;
};

export const redisService: RedisService = (base, identifier) => {
  const key = `${identifier ? identifier + ":" : ""}${base}`;

  return {
    get() {
      return new Promise((resolve, reject) => {
        client.get(key, (error: any, result: any) => {
          resolve(JSON.parse(result));
        });
      });
    },
    setExpire(data, time) {
      client.set(key, JSON.stringify(data));
      client.expire(key, time);
    },
    del() {
      client.del(key);
    },
    incr() {
      client.incr("api");
    },
    client
  };
};
