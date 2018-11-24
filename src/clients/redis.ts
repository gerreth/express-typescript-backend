import redis from "redis";

import { SpotifyBand } from "./spotify";

const host = process.env.REDIS_HOST;
const auth = process.env.REDIS_AUTH;
const port = process.env.REDIS_PORT;

console.log({ host, auth, port });
class Redis {
  client: any;

  constructor() {
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

    this.client = client;
  }

  get(key: String): Promise<SpotifyBand[]> {
    return new Promise((resolve, reject) => {
      this.client.get(key, (error: any, result: any) => {
        resolve(JSON.parse(result));
      });
    });
  }

  setExpire(key: String, data: any, time: Number): void {
    this.client.set(key, JSON.stringify(data));
    this.client.expire(key, time);
  }

  del(key: String): void {
    this.client.del(key);
  }
}

export default new Redis();
