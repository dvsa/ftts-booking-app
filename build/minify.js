const fs = require('fs');
const minify = require('minify');

minify('node_modules/govuk-frontend/govuk/all.js', {
  js: {
    compress: true,
    ecma: 5,
  },
}).then((data) => fs.writeFileSync('dist/assets/javascripts/all.min.js', data));

minify('ftts-frontend-assets/assets/javascripts/session-timeout.js', {
  js: {
    compress: true,
    ecma: 5,
  },
}).then((data) => fs.writeFileSync('dist/assets/javascripts/session-timeout.min.js', data));

minify('ftts-frontend-assets/assets/javascripts/date-picker.js', {
  js: {
    compress: true,
    ecma: 5,
  },
}).then((data) => fs.writeFileSync('dist/assets/javascripts/date-picker.min.js', data));

minify('ftts-frontend-assets/assets/javascripts/google-analytics-helper.js', {
  js: {
    compress: true,
    ecma: 5,
  },
}).then((data) => fs.writeFileSync('dist/assets/javascripts/google-analytics-helper.min.js', data));

minify('ftts-frontend-assets/assets/javascripts/loading-spinner.js', {
  js: {
    compress: true,
    ecma: 5,
  },
}).then((data) => fs.writeFileSync('dist/assets/javascripts/loading-spinner.min.js', data));
