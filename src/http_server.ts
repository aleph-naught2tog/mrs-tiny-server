import http from "http"; // docs: https://nodejs.org/api/http.html

import path from "path"; // docs: https://nodejs.org/api/path.html
import url from "url"; // docs: https://nodejs.org/api/url.html

const SRC_FOLDER_PATTERN = '/src/';

export const determineContentType = (extension: string): string => {
  const map: { [key: string]: string } = {
    css: "text/css",
    js: "text/javascript",
    html: "text/html",
    plain: "text/plain",
    json: "text/javascript"
  };

  if (extension in map) {
    return map[extension];
  } else {
    return map.plain;
  }
};

export const isModuleRequest = (request: http.IncomingMessage): boolean => {
  // `referer` is the header that represents who made the request
  const referer = request.headers.referer;
  if (!referer) {
    return false;
  } else {
    return referer.includes(SRC_FOLDER_PATTERN);
  }
};

export const getServerPathForUrl = (
  request: http.IncomingMessage,
  serverRootFolder: string
): string => {
  if (!request.url) {
    throw new Error("Request had no URL");
  }

  const parsedUrl = url.parse(request.url);
  const pathName = parsedUrl.pathname;

  if (isModuleRequest(request)) {
    if (pathName && pathName.includes(".json")) {
      return `${serverRootFolder}${pathName}`;
    } else {
      return `${serverRootFolder}${pathName}.js`;
    }
  } else {
    // This ensures that navigating to "localhost:PORT" just loades the homepage
    if (parsedUrl.pathname === "/") {
      return `${serverRootFolder}${pathName}index.html`;
    } else {
      return `${serverRootFolder}${pathName}`;
    }
  }
};

export const setContentType = (
  response: http.ServerResponse,
  filePath: string
): void => {

  const parsedFileName = path.parse(filePath);

  // `.replace(".", "")` removes the `.`, by replacing it with nothing (an empty string)
  const extension = parsedFileName.ext.replace(".", "");
  const contentType = determineContentType(extension);

  response.setHeader("Content-Type", contentType);
};
