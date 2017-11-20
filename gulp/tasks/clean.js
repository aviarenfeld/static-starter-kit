var gulp   = require('../config').gulp;
var del    = require('del');
var config = require('../config');

gulp.task('clean', require('del').bind( null, config.paths.dest ));
