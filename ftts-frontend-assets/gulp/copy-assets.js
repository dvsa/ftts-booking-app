/*
  copy.js
  ===========
  copies images and javascript folders to public
*/

const gulp = require('gulp')
const config = require('./config.json')

gulp.task('copy-local-fonts', () => {
  return gulp
  .src([config.paths.assets + '/**', '!' + config.paths.assets + 'sass{,/**/*}'])
  .pipe(gulp.dest(config.paths.public))
})

gulp.task('copy-govuk-fonts', () => {
  const govukPath = config.paths.nodeModules + config.paths.govuk + config.paths.assets
  return gulp
  .src([govukPath + '/**', '!' + govukPath + 'sass{,/**/*}'])
  .pipe(gulp.dest(config.paths.public))
})

gulp.task('copy-govuk-js', () => {
  const govukJs = config.paths.nodeModules + config.paths.govuk + 'all.js'
  return gulp
  .src(govukJs)
  .pipe(gulp.dest(config.paths.public + config.paths.javascripts))
})

gulp.task('copy-assets', gulp.series('copy-local-fonts', 'copy-govuk-fonts', 'copy-govuk-js'))
