var gulp         = require('../config').gulp;
var replace      = require('gulp-replace');
var browserSync  = require('browser-sync');
var eslint       = require('gulp-eslint');
var handleErrors = require('../util/handleErrors');
var config       = require('../config').scripts;

gulp.task('lint', function() {
  return gulp.src(config.src)
        .pipe(eslint())
        .pipe(eslint.format());
});


gulp.task('scripts', ['lint'], function() {
  return gulp.src( config.src )
        .pipe(gulp.dest(config.dest));
});