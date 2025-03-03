/**
 * Modified version of axios-jwt (https://github.com/jetbridge/axios-jwt)
 * that uses reactive local storage
 */

import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { jwtDecode } from "jwt-decode";
import { useStorage } from "@vueuse/core";
import { computed } from "vue";

// a little time before expiration to try refresh (seconds)
const EXPIRE_FUDGE = 10;
export const STORAGE_KEY = `auth-tokens-${import.meta.env.MODE}`;

type Token = string;
export interface IAuthTokens {
  accessToken: Token;
  refreshToken: Token;
}

export type TokenRefreshRequest = (
  refreshToken: Token
) => Promise<Token | IAuthTokens>;

export interface IAuthTokenInterceptorConfig {
  header?: string;
  headerPrefix?: string;
  requestRefresh: TokenRefreshRequest;
}

const state = useStorage(STORAGE_KEY, { accessToken: "", refreshToken: "" });

export default () => {
  // EXPORTS

  /**
   * Checks if refresh tokens are stored
   * @returns Whether the user is logged in or not
   */
  const isLoggedIn = computed((): boolean => {
    const token = getRefreshToken.value;
    return !!token;
  });

  /**
   * Sets the access and refresh tokens
   * @param {IAuthTokens} tokens - Access and Refresh tokens
   */
  const setAuthTokens = (tokens: IAuthTokens): void => {
    state.value.refreshToken = tokens.refreshToken;
    state.value.accessToken = tokens.accessToken;
  };

  /**
   * Sets the access token
   * @param {string} token - Access token
   */
  const setAccessToken = (token: Token): void => {
    const tokens = getAuthTokens.value;
    if (!tokens) {
      throw new Error(
        "Unable to update access token since there are not tokens currently stored"
      );
    }

    tokens.accessToken = token;
    setAuthTokens(tokens);
  };

  /**
   * Clears both tokens
   */
  const clearAuthTokens = (): void => {
    state.value.accessToken = "";
    state.value.refreshToken = "";
  };

  /**
   * Returns the stored refresh token
   * @returns {string} Refresh token
   */
  const getRefreshToken = computed((): Token | undefined => {
    const tokens = getAuthTokens.value;
    return tokens ? tokens.refreshToken : undefined;
  });

  /**
   * Returns the stored access token
   * @returns {string} Access token
   */
  const getAccessToken = computed((): Token | undefined => {
    const tokens = getAuthTokens.value;

    return tokens ? tokens.accessToken : undefined;
  });

  /**
   * @callback requestRefresh
   * @param {string} refreshToken - Token that is sent to the backend
   * @returns {Promise} Promise that resolves in an access token
   */

  /**
   * Gets the current access token, exchanges it with a new one if it's expired and then returns the token.
   * @param {requestRefresh} requestRefresh - Function that is used to get a new access token
   * @returns {string} Access token
   */
  const refreshTokenIfNeeded = async (
    requestRefresh: TokenRefreshRequest
  ): Promise<Token | undefined> => {
    // use access token (if we have it)
    let accessToken = getAccessToken.value;

    // check if access token is expired
    if (!accessToken || isTokenExpired(accessToken)) {
      // do refresh
      accessToken = await refreshToken(requestRefresh);
    }

    return accessToken;
  };

  /**
   *
   * @param {Axios} axios - Axios instance to apply the interceptor to
   * @param {IAuthTokenInterceptorConfig} config - Configuration for the interceptor
   */
  const applyAuthTokenInterceptor = (
    axios: AxiosInstance,
    config: IAuthTokenInterceptorConfig
  ): void => {
    if (!axios.interceptors)
      throw new Error(`invalid axios instance: ${axios}`);
    axios.interceptors.request.use(authTokenInterceptor(config));
  };

  // PRIVATE

  /**
   *  Returns the refresh and access tokens
   * @returns {IAuthTokens} Object containing refresh and access tokens
   */
  const getAuthTokens = computed((): IAuthTokens | undefined => {
    if (
      state.value.refreshToken === "" ||
      state.value.accessToken === "" ||
      !state.value
    )
      return;

    return state.value;
  });

  /**
   * Checks if the token is undefined, has expired or is about the expire
   *
   * @param {string} token - Access token
   * @returns Whether or not the token is undefined, has expired or is about the expire
   */
  const isTokenExpired = (token: Token): boolean => {
    if (!token) return true;
    const expiresIn = getExpiresIn(token);
    return !expiresIn || expiresIn <= EXPIRE_FUDGE;
  };

  /**
   * Gets the unix timestamp from an access token
   *
   * @param {string} token - Access token
   * @returns {string} Unix timestamp
   */
  const getTimestampFromToken = (token: Token): number | undefined => {
    const decoded = jwtDecode<{ [key: string]: number }>(token);

    return decoded?.exp;
  };

  /**
   * Returns the number of seconds before the access token expires or -1 if it already has
   *
   * @param {string} token - Access token
   * @returns {number} Number of seconds before the access token expires
   */
  const getExpiresIn = (token: Token): number => {
    const expiration = getTimestampFromToken(token);

    if (!expiration) return -1;

    return expiration - Date.now() / 1000;
  };

  /**
   * Refreshes the access token using the provided function
   *
   * @param {requestRefresh} requestRefresh - Function that is used to get a new access token
   * @returns {string} - Fresh access token
   */
  const refreshToken = async (
    requestRefresh: TokenRefreshRequest
  ): Promise<Token> => {
    const refreshToken = getRefreshToken.value;
    if (!refreshToken) throw new Error("No refresh token available");

    try {
      isRefreshing = true;

      // Refresh and store access token using the supplied refresh function
      const newTokens = await requestRefresh(refreshToken);
      if (typeof newTokens === "object" && newTokens?.accessToken) {
        await setAuthTokens(newTokens);
        return newTokens.accessToken;
      } else if (typeof newTokens === "string") {
        await setAccessToken(newTokens);
        return newTokens;
      }

      throw new Error(
        "requestRefresh must either return a string or an object with an accessToken"
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // Failed to refresh token
      const status = error?.response?.status;
      if (status === 401 || status === 422) {
        // The refresh token is invalid so remove the stored tokens
        clearAuthTokens();
        throw new Error(
          `Got ${status} on token refresh; clearing both auth tokens`
        );
      } else {
        // A different error, probably network error
        throw new Error(`Failed to refresh auth token: ${error.message}`);
      }
    } finally {
      isRefreshing = false;
    }
  };

  /**
   * Function that returns an Axios Intercepter that:
   * - Applies that right auth header to requests
   * - Refreshes the access token when needed
   * - Puts subsequent requests in a queue and executes them in order after the access token has been refreshed.
   *
   * @param {IAuthTokenInterceptorConfig} config - Configuration for the interceptor
   * @returns {Promise} Promise that resolves in the supplied requestConfig
   */
  const authTokenInterceptor =
    ({
      header = "Authorization",
      headerPrefix = "Bearer ",
      requestRefresh,
    }: IAuthTokenInterceptorConfig) =>
    async (
      requestConfig: InternalAxiosRequestConfig
    ): Promise<InternalAxiosRequestConfig> => {
      // We need refresh token to do any authenticated requests
      if (!getRefreshToken.value) return requestConfig;

      // Queue the request if another refresh request is currently happening
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        })
          .then((token) => {
            if (requestConfig.headers) {
              requestConfig.headers[header] = `${headerPrefix}${token}`;
            }
            return requestConfig;
          })
          .catch(Promise.reject);
      }

      // Do refresh if needed
      let accessToken;
      try {
        accessToken = await refreshTokenIfNeeded(requestRefresh);
        resolveQueue(accessToken);
      } catch (error: unknown) {
        if (error instanceof Error) {
          declineQueue(error);
          clearAuthTokens();
          throw new Error(
            `Unable to refresh access token for request due to token refresh error: ${error.message}`
          );
        }
      }

      // add token to headers
      if (accessToken && requestConfig.headers)
        requestConfig.headers[header] = `${headerPrefix}${accessToken}`;
      return requestConfig;
    };

  type RequestsQueue = {
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
  }[];

  let isRefreshing = false;
  let queue: RequestsQueue = [];

  /**
   * Function that resolves all items in the queue with the provided token
   * @param token New access token
   */
  const resolveQueue = (token?: Token) => {
    queue.forEach((p) => {
      p.resolve(token);
    });

    queue = [];
  };

  /**
   * Function that declines all items in the queue with the provided error
   * @param error Error
   */
  const declineQueue = (error: Error) => {
    queue.forEach((p) => {
      p.reject(error);
    });

    queue = [];
  };
  return {
    isLoggedIn,
    setAuthTokens,
    setAccessToken,
    clearAuthTokens,
    getRefreshToken,
    getAccessToken,
    refreshTokenIfNeeded,
    applyAuthTokenInterceptor,
    authTokenInterceptor,
  };
};
