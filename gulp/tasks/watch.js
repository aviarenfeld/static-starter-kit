/* Notes:
   - gulp/tasks/browserSync.js watches and reloads compiled files
*/

var gulp   = require('../config').gulp;
var config = require('../config');
var watch  = require('gulp-watch');

gulp.task('watch', ['browser-sync'], function(callback) {
  watch(config.sass.src, function() { gulp.start('sass'); });
  watch(config.images.src, function() { gulp.start('images'); });
  watch(config.html.files, function() { gulp.start('html'); });
  watch(config.scripts.src, function() { gulp.start('webpack:build-dev'); });
});
