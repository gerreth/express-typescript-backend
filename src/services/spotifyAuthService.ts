import axios from "axios";
// Return types
export type IGetRefreshTokenResponse = {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
};

export type IGetTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
};

// Method types
export type IGetRefreshToken = (
  refresh_token: string
) => Promise<IGetRefreshTokenResponse>;
export type IGetToken = (
  code: string,
  redirect_uri: string
) => Promise<IGetTokenResponse>;

export type spotifyAuthServiceReturn = {
  getRefreshToken: IGetRefreshToken;
  getToken: IGetToken;
};
// Service type
export type spotifyAuthService = () => spotifyAuthServiceReturn;

const spotifyAuthService: spotifyAuthService = () => {
  const client_id = process.env.CLIENT_ID;
  const client_secret = process.env.CLIENT_SECRET;
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization: `Basic ${new Buffer(
      `${client_id}:${client_secret}`
    ).toString("base64")}`
  };
  const options = {
    headers,
    method: "post",
    url: "https://accounts.spotify.com/api/token"
  };

  return {
    async getToken(code, redirect_uri) {
      const grant_type = "authorization_code";

      const response = await axios({
        ...options,
        params: { grant_type, code, redirect_uri }
      });

      return response.data;
    },
    async getRefreshToken(refresh_token) {
      const grant_type = "refresh_token";

      const response = await axios({
        ...options,
        params: { grant_type, refresh_token }
      });

      return response.data;
    }
  };
};

export default spotifyAuthService;
