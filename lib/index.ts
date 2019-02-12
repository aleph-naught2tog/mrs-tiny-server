import http from 'http';
import fs from 'fs';

import { getFolderWatcher } from './folder_watcher';
import { startTypescriptCompiler } from './typescript_compiler';
import { getSocketServer, sendToSocketClients } from './socket_server';
import { setContentType, getServerPathForUrl } from './http_server';
import { setCleanupActions } from './process_helpers';

export function run() {
  /* HEY YOUR SCSS IS BROKEN BECAUSE OF THIS HERE LINE */
  const SHOULD_COMPILE_SCSS = false;

  const [_shell, _script, serverRootFolder = 'build'] = process.argv;

  const PORT: number = 3000;
  const SOCKET_PORT: number = 3333;

  const SERVER_ROOT_FOLDER: string = `${process.cwd()}/${serverRootFolder}`;
  const SERVER_PUBLIC_FOLDER: string = `${process.cwd()}/public`;

  const FOLDER: string = process.cwd() + '';
  const SCSS_INPUT: string = `${FOLDER}/scss`;
  const CSS_OUTPUT: string = `${SERVER_ROOT_FOLDER}/css`;

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

  const handleRequest = (
    request: http.IncomingMessage,
    response: http.ServerResponse
  ) => {
    console.log(`[http] ${request.method} ${request.url}`);

    if (request.url === '/favicon.ico') {
      response.statusCode = 404;
      response.end();
      return;
    }

    const filePath = getServerPathForUrl(request, SERVER_ROOT_FOLDER);

    fs.readFile(filePath, (error, fileData: Buffer) => {
      if (error) {
        console.error('[http]', error);
        response.statusCode = 500; // internal server error
        response.end('There was an error getting the request file.');
      } else {
        setContentType(response, filePath);
        response.end(fileData);
      }
    });
  };

  const httpServer = http.createServer(handleRequest);
  const socketServer = getSocketServer(SOCKET_PORT);
  const fileWatcher = getFolderWatcher(SERVER_ROOT_FOLDER);
  const rootPublicWatcher = getFolderWatcher(SERVER_PUBLIC_FOLDER);

  const scssCompiler = SHOULD_COMPILE_SCSS ? getScssCompiler() : null;

  const handleFileChange = (event: string, filename?: string) => {
    if (filename && /\.map$/.test(filename)) {
      return;
    }

    const data: {} = {
      event: event,
      filename: filename,
      shouldReload: true
    };

    sendToSocketClients(socketServer, data);
  };

  const typescriptCompiler = startTypescriptCompiler();

  fileWatcher.on('change', handleFileChange);
  rootPublicWatcher.on('change', (event: string, filename?: string) => {
    if (filename) {
      const fileData = fs.readFileSync(`${SERVER_PUBLIC_FOLDER}/${filename}`);
      fs.writeFileSync(`${SERVER_ROOT_FOLDER}/${filename}`, fileData);
      sendToSocketClients(socketServer, { event: event, shouldReload: true });
    }
  });

  setCleanupActions([
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
    console.log(`[http] Listening: http://localhost:${PORT}`);
  });
}
