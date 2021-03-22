/*
  tasks.js
  ===========
  defaults wraps generate-assets, watch and server
*/

const gulp = require('gulp')
const config = require('./config.json')

gulp.task('watch-sass', () => {
  return gulp.watch(config.paths.assets + 'sass/**', {cwd: './'}).on('change', gulp.series('sass'))
})

gulp.task('watch-assets', () => {
  gulp.watch([config.paths.assets + 'images/**',
    config.paths.assets + 'javascripts/**'], {cwd: './'}).on('change', gulp.series('copy-assets'))
})

gulp.task('watch', gulp.parallel('watch-assets', 'watch-sass'))

gulp.task('upgrade', gulp.series('clean', 'govuk'))

gulp.task('generate-assets', gulp.series('clean', 'sass', 'copy-assets'))
