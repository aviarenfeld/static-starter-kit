var gulp         = require('../config').gulp;
var gutil        = require('gulp-util');
var browserSync  = require('browser-sync');
var sass         = require('gulp-sass');
var sourcemaps   = require('gulp-sourcemaps');
var handleErrors = require('../util/handleErrors');
var config       = require('../config').sass;
var environment  = require('../config').environment;
var filter       = require('gulp-filter');
var autoprefixer = require('gulp-autoprefixer');
var minifyCss    = require('gulp-minify-css');

gulp.task('sass', function () {
  return gulp.src(config.src)
        .pipe(environment.sourcemaps ? sourcemaps.init() : gutil.noop())
        .pipe(sass(config.settings))
        .on('error', handleErrors)
        .pipe(autoprefixer({
          browsers: ['last 2 versions'],
          cascade: false
        }))
        .pipe(config.minify ? minifyCss() : gutil.noop())
        .pipe(environment.sourcemaps ? sourcemaps.write('.', {
          includeContent: false,
        }) : gutil.noop() )
        .pipe(gulp.dest(config.dest))
        .pipe(filter('**/*.css'))
        .pipe(browserSync.reload({stream:true}));
});
