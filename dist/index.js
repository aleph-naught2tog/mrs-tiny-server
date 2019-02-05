"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const fs_1 = __importDefault(require("fs"));
const SHOULD_COMPILE_SCSS = false;
const [_shell, _script, serverRootFolder = 'build'] = process.argv;
const folder_watcher_1 = require("./folder_watcher");
const typescript_compiler_1 = require("./typescript_compiler");
const socket_server_1 = require("./socket_server");
const http_server_1 = require("./http_server");
const process_helpers_1 = require("./process_helpers");
const PORT = 3000;
const SOCKET_PORT = 3333;
const SERVER_ROOT_FOLDER = `${process.cwd()}/${serverRootFolder}`;
const SERVER_PUBLIC_FOLDER = `${process.cwd()}/public`;
const FOLDER = process.cwd() + '';
const SCSS_INPUT = `${FOLDER}/scss`;
const CSS_OUTPUT = `${SERVER_ROOT_FOLDER}/css`;
const getScssCompiler = () => {
    const child_process = require('child_process');
    const options = [
        '--watch',
        `${SCSS_INPUT}:${CSS_OUTPUT}`,
        '--sourcemap=none'
    ];
    const scssCompiler = child_process.spawn('scss', options);
    return scssCompiler;
};
const handleRequest = (request, response) => {
    console.log(`[http] ${request.method} ${request.url}`);
    if (request.url === '/favicon.ico') {
        response.statusCode = 404;
        response.end();
        return;
    }
    const filePath = http_server_1.getServerPathForUrl(request, SERVER_ROOT_FOLDER);
    fs_1.default.readFile(filePath, (error, fileData) => {
        if (error) {
            console.error('[http]', error);
            response.statusCode = 500;
            response.end('There was an error getting the request file.');
        }
        else {
            http_server_1.setContentType(response, filePath);
            response.end(fileData);
        }
    });
};
const httpServer = http_1.default.createServer(handleRequest);
const socketServer = socket_server_1.getSocketServer(SOCKET_PORT);
const fileWatcher = folder_watcher_1.getFolderWatcher(SERVER_ROOT_FOLDER);
const scssCompiler = SHOULD_COMPILE_SCSS ? getScssCompiler() : null;
const rootPublicWatcher = folder_watcher_1.getFolderWatcher(SERVER_PUBLIC_FOLDER);
const handleFileChange = (event, filename, maybeData) => {
    if (filename && /\.map$/.test(filename)) {
        return;
    }
    const data = {
        event: event,
        filename: filename,
        shouldReload: maybeData
    };
    socket_server_1.sendToSocketClients(socketServer, data);
};
const typescriptCompiler = typescript_compiler_1.startTypescriptCompiler();
fileWatcher.on('change', handleFileChange);
rootPublicWatcher.on('change', (event, filename) => {
    if (filename) {
        const fileData = fs_1.default.readFileSync(`${SERVER_PUBLIC_FOLDER}/${filename}`);
        fs_1.default.writeFileSync(`${SERVER_ROOT_FOLDER}/${filename}`, fileData);
        socket_server_1.sendToSocketClients(socketServer, { event: event, shouldReload: true });
    }
});
process_helpers_1.setCleanupActions([
    () => {
        if (scssCompiler) {
            console.error('[scss] Shutting down.');
            scssCompiler.removeAllListeners();
            scssCompiler.kill();
        }
    },
    () => {
        if (typescriptCompiler) {
            console.error('[tsc] Shutting down.');
            typescriptCompiler.kill();
        }
    },
    () => {
        if (socketServer) {
            console.error('[ws] Shutting down.');
            socketServer.clients.forEach(client => client.terminate());
            socketServer.close();
        }
    },
    () => {
        if (httpServer) {
            console.error('[http] Shutting down.');
            httpServer.close();
        }
    }
]);
httpServer.listen(PORT, () => {
    console.log(`[http] Listening on port ${PORT}`);
});
