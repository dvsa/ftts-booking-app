/* eslint-disable global-require, import/no-extraneous-dependencies */
// For running tests with Jest
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
  ],
  plugins: [
    [
      require('@babel/plugin-proposal-class-properties'),
    ],
  ],
};
