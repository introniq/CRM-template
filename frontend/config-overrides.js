const webpack = require('webpack');

module.exports = function override(config) {
  config.resolve.fallback = {
    path: require.resolve('path-browserify'),
    fs: false, 
  };
  return config;
};