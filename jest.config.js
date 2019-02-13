module.exports = {
  testMatch: ['**/__tests__/*.(js|ts)'],
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.(ts)$': 'ts-jest'
  },
  globals: {
    'ts-jest': {
      diagnostics: {
        ignoreCodes: [6053]
      }
    }
  }
};
