// `@env` values are inlined at transform time, so tests need their own file of
// deterministic (dummy) credentials rather than a jest module mock.
const fs = require('fs');
const path = require('path');
const envPath = '.env';

let envHash = '';
try {
  const fullPath = path.resolve(__dirname, envPath);
  if (fs.existsSync(fullPath)) {
    envHash = fs.statSync(fullPath).mtimeMs.toString();
  }
} catch (e) {}

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@': './app',
        },
      },
    ],
    'react-native-reanimated/plugin',
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: envPath,
        safe: false,
        allowUndefined: true,
        envHash: envHash,
      },
    ],
  ],
};