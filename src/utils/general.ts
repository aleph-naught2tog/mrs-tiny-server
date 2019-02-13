import path from 'path';

export const cwdTo = (...pathPartsToJoin: string[]): string => {
  const cwd = process.cwd();
  return path.join(cwd, ...pathPartsToJoin);
};
