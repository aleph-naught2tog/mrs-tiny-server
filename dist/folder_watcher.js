"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
function getFolderWatcher(folder) {
    const options = { recursive: true };
    const watcher = fs_1.default.watch(folder, options);
    watcher.on("error", error => {
        console.error("[watcher]", error);
    });
    return watcher;
}
exports.getFolderWatcher = getFolderWatcher;
