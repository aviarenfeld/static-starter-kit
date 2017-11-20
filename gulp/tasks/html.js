var gulp        = require('../config').gulp;
var paths        = require('../config').paths;
var replace     = require('gulp-replace');
var htmlmin     = require('gulp-htmlmin');
var config      = require('../config').html;
var browserSync = require('browser-sync');
var fileinclude = require('gulp-file-include');
var Handlebars  = require('handlebars');
var fs          = require('fs');

Handlebars.registerHelper('if_eq', function(a, b, opts) {
  if(a == b) // Or === depending on your needs
    return opts.fn(this);
  else
    return opts.inverse(this);
});

Handlebars.registerHelper('lookup', function (obj, key) {
  return obj[key];
});

// HTML Files
gulp.task('html', function() {
  return gulp.src(config.src)
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file',
      filters: {
        handlebars: function(content, options){
          var template = Handlebars.compile(content);
          if( options.data ) {
            try {
              var contents = fs.readFileSync( paths.src + '/data/' + options.data + '.json');
              options.data = JSON.parse(contents);
            } catch (err) {
              console.log('Error loading collection.', err);
            }
          }
          return template( options );
        }
      }
    }))
    .pipe(replace('[cachebuster]', new Date().getTime()))
    .pipe(htmlmin({removeComments:true}))
    .pipe(gulp.dest( config.dest ))
    .pipe(browserSync.reload({stream:true}));
});