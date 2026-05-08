import { axiosInstance } from "../../app/lib/axiosInstance";

const PROXY_PREFIX = "/api/v1/media/";

export const isProxyPath = (url: string | undefined | null): url is string =>
  typeof url === "string" && url.startsWith(PROXY_PREFIX);

// Module-lifetime cache. Same proxy path requested twice = single fetch + shared blob URL.
// Blob URLs persist until the page unloads; acceptable for the typical handful of covers per page.
const cache = new Map<string, Promise<string>>();

export const fetchAuthedBlobUrl = (relativePath: string): Promise<string> => {
  const cached = cache.get(relativePath);
  if (cached) return cached;

  // axiosInstance has baseURL set to VITE_API_BASE_URL (e.g. https://api.muxify.com/api/v1).
  // The proxy paths returned by the backend already start with /api/v1/, so we strip the
  // duplicate prefix to avoid hitting /api/v1/api/v1/media/...
  const baseURL = axiosInstance.defaults.baseURL ?? "";
  const apiV1Suffix = "/api/v1";
  const stripped =
    baseURL.endsWith(apiV1Suffix) && relativePath.startsWith(apiV1Suffix)
      ? relativePath.slice(apiV1Suffix.length)
      : relativePath;

  const promise = axiosInstance
    .get<Blob>(stripped, { responseType: "blob" })
    .then((response) => URL.createObjectURL(response.data))
    .catch((err) => {
      cache.delete(relativePath);
      throw err;
    });

  cache.set(relativePath, promise);
  return promise;
};
