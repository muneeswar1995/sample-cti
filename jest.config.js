module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['<rootDir>/jest.setup.js'],
  // These ship untranspiled ESM, so they have to go through babel like RN itself.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|react-native-vector-icons|react-native-maps|react-native-safe-area-context|react-native-gesture-handler|react-native-reanimated|@react-navigation)/)',
  ],
};
