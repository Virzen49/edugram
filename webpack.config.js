const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    babel: {
      dangerouslyAllowMultipleFiles: true,
    },
  }, argv);

  // Handle React Native packages that don't work on web
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native-youtube-iframe': false,
    'react-native-webview': 'react-native-web-webview',
    'react-native-pdf': false,
  };

  return config;
};