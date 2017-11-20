var gulp               = require('gulp');
var iconfont           = require('gulp-iconfont');
var config             = require('../../config').symbols;
var generateStylesheet = require('./generate-stylesheet');

gulp.task('symbols', function() {
  return gulp.src(config.src)
        .pipe(iconfont(config.options))
        .on('glyphs', generateStylesheet)
        .pipe(gulp.dest(config.dest));
});