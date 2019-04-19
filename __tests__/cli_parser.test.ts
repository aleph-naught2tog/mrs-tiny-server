import { parseCommandLineArguments } from '../src/config/parser';

describe('should ignore first two arguments', () => {
  const processArgV = ['path/to/interpreter', 'path/to/script'];
  it('should return an empty object when no args sent in', () => {
    expect(parseCommandLineArguments(processArgV)).toEqual({});
  });
});
