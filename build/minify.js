/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const minify = require('minify');

minify('dist/public/javascripts/all.js', {
  js: {
    compress: true,
    ecma: 5,
  },
}).then((data) => fs.writeFileSync('dist/public/javascripts/all.min.js', data));
