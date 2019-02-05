"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const url_1 = __importDefault(require("url"));
const SRC_FOLDER_PATTERN = '/src/';
exports.determineContentType = (extension) => {
    const map = {
        css: "text/css",
        js: "text/javascript",
        html: "text/html",
        plain: "text/plain",
        json: "text/javascript"
    };
    if (extension in map) {
        return map[extension];
    }
    else {
        return map.plain;
    }
};
exports.isModuleRequest = (request) => {
    const referer = request.headers.referer;
    if (!referer) {
        return false;
    }
    else {
        return referer.includes(SRC_FOLDER_PATTERN);
    }
};
exports.getServerPathForUrl = (request, serverRootFolder) => {
    if (!request.url) {
        throw new Error("Request had no URL");
    }
    const parsedUrl = url_1.default.parse(request.url);
    const pathName = parsedUrl.pathname;
    if (exports.isModuleRequest(request)) {
        if (pathName && pathName.includes(".json")) {
            return `${serverRootFolder}${pathName}`;
        }
        else {
            return `${serverRootFolder}${pathName}.js`;
        }
    }
    else {
        if (parsedUrl.pathname === "/") {
            return `${serverRootFolder}${pathName}index.html`;
        }
        else {
            return `${serverRootFolder}${pathName}`;
        }
    }
};
exports.setContentType = (response, filePath) => {
    const parsedFileName = path_1.default.parse(filePath);
    const extension = parsedFileName.ext.replace(".", "");
    const contentType = exports.determineContentType(extension);
    response.setHeader("Content-Type", contentType);
};
