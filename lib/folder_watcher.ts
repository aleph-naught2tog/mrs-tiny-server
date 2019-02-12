import fs from 'fs';

export function getFolderWatcher(folder: string): fs.FSWatcher {
  const options = { recursive: true };
  let watcher: fs.FSWatcher | null = null;

  try {
    watcher = fs.watch(folder, options);
  } catch (error) {
    if (error.code && error.code.toLowerCase() === 'enoent') {
      fs.mkdirSync(folder);
      watcher = fs.watch(folder, options);
    }
  } finally {
    if (null === watcher) {
      throw new Error('Error instantiating file watcher for ' + folder);
    }

    watcher.on('error', error => {
      console.error('[watcher]', error);
    });

    return watcher;
  }
}
