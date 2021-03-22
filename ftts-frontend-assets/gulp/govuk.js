/*
  upgrade-govuk.js
  ===========
  upgrades GOV.UK packages to their latest versions
*/

const gulp = require('gulp')
const run = require('gulp-run-command').default

gulp.task('govuk', async () => {
  run('ncu -f "/^govuk.*$/" -u')()
  run('npm install')()
  run('npm audit fix')()
})
