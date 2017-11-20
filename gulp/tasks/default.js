var gulp        = require('../config').gulp;
var sequence    = require('gulp-sequence');
var environment = require('../config').environment;

gulp.task('build', function(cb){
  var tasks = ['clean', 'symbols', [ 'images', 'sass', 'html', 'fonts' ]];
  if ( environment === 'production' ) {
    tasks.push( 'webpack:build' );
  } else {
    tasks.push( 'webpack:build-dev' );
  }
  tasks.push(cb);
  sequence.apply(this, tasks);
});

gulp.task('default', [], function(cb) {
  sequence( 'build', 'watch', cb );
});
