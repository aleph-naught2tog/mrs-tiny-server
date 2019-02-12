import child_process from 'child_process'; // https://nodejs.org/api/child_process.html

export function startTypescriptCompiler(
  tsconfigPathRelativeToCwd: string = 'tsconfig.json'
): child_process.ChildProcess {
  const configPath = process.cwd() + '/' + tsconfigPathRelativeToCwd;
  const defaultOptions = ['--pretty', '--preserveWatchOutput'];
  const projectOptions = ['--project', configPath];

  const typescriptProcess = child_process.spawn('tsc', [
    '--watch',
    ...defaultOptions,
    ...projectOptions
  ]);

  typescriptProcess.stdout.on('data', (data: Buffer) => {
    const message = data.toString('utf8').trim();
    console.log('[tsc:out]', message);
  });

  typescriptProcess.stderr.on('data', (data: Buffer) => {
    console.error('[tsc:err]', data.toString('utf8').trim());
  });

  return typescriptProcess;
}
