"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
function getFolderWatcher(folder) {
    const options = { recursive: true };
    let watcher = null;
    try {
        watcher = fs_1.default.watch(folder, options);
    }
    catch (error) {
        if (error.code && error.code.toLowerCase() === 'enoent') {
            fs_1.default.mkdirSync(folder);
            watcher = fs_1.default.watch(folder, options);
        }
    }
    finally {
        if (null === watcher) {
            throw new Error('Error instantiating file watcher for ' + folder);
        }
        watcher.on('error', error => {
            console.error('[watcher]', error);
        });
        return watcher;
    }
}
exports.getFolderWatcher = getFolderWatcher;
