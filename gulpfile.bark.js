// Globals:
var gulp        = require('gulp'),
    gutil       = require('gulp-util'),
    fs          = require('fs'),
    runSequence = require('run-sequence'),
    sass        = require('gulp-sass'),
    sourcemaps  = require('gulp-sourcemaps'),
    express     = require('express'),
    browserSync = require('browser-sync'),
    merge       = require('merge-stream'),
    minimist    = require('minimist'),
    minifyCss   = require('gulp-minify-css'),
    uglify      = require('gulp-uglify'),
    imagemin    = require('gulp-imagemin'),
    jshint      = require('gulp-jshint'),
    sketch      = require('gulp-sketch'),
    iconfont    = require('gulp-iconfont'),
    consolidate = require('gulp-consolidate'),
    addsrc      = require('gulp-add-src'),
    flatten     = require('gulp-flatten'),
    concat      = require('gulp-concat'),
    rename      = require('gulp-rename'),
    which       = require('npm-which')(__dirname),
    filter      = require('gulp-filter'),
    robots      = require('gulp-robots'),
    fileinclude = require('gulp-file-include'),
    Handlebars  = require('handlebars'),
    autoprefixer = require('gulp-autoprefixer');

// CLI Options:
var options     = minimist(process.argv),
    environment = options.environment || options.e || 'development',
    server      = express()
    config      = require('./config/'+environment+'.json');

// Output Environment:
if ( options.environment || options.e ) {
  console.log('Environment: ' + environment );
} else {
  console.log('Environment: ' + environment + ' (default)' );
}

// Asset-Builder Options:
var manifest = require('asset-builder')('./src/manifest.json'),
    path     = manifest.paths,
    globs    = manifest.globs,
    project  = manifest.getProjectGlobs();

gulp.task('clean', require('del').bind( null, path.dist ));

// CSS Processing
gulp.task('styles', function() {
  var merged = merge();
  manifest.forEachDependency('css', function(dep) {
    merged.add(
      gulp.src(dep.globs, {base: 'styles'})
        .pipe( config.sourcemaps ? sourcemaps.init() : gutil.noop() )
        .pipe(sass({
          outputStyle: 'nested',
          precision: 10
        }).on('error', sass.logError))
        .pipe(concat(dep.name))
        .pipe(config.minify ? minifyCss() : gutil.noop())
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe( config.sourcemaps ? sourcemaps.write('.', {
          includeContent: false,
        }) : gutil.noop() )
        .pipe(gulp.dest('dist'))
    );
  });

  return merged
    .pipe(flatten())
    .pipe(gulp.dest( path.dist + 'styles' ))
    .pipe(filter('**/*.css'))
    .pipe(reload({stream:true}));
});

// JS Processing
gulp.task('jshint', function() {
  return gulp.src( path.source + 'scripts/*.js' )
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('scripts', ['jshint'], function() {
  var merged = merge();
  manifest.forEachDependency('js', function(dep) {
    merged.add(
      gulp.src( dep.globs, {base: 'scripts'} )
        .pipe( config.sourcemaps ? sourcemaps.init() : gutil.noop() )
        .pipe( concat(dep.name) )
        .pipe( config.uglify ? uglify() : gutil.noop() )
        .pipe( config.sourcemaps ? sourcemaps.write('.', {
          includeContent: false,
        }) : gutil.noop() )
    );
  });

  return merged
    .pipe(flatten())
    .pipe(gulp.dest( path.dist + 'scripts' ))
    .pipe(reload());
});

// Polyfills
gulp.task('polyfills', function() {
  return gulp.src(project.polyfills)
    .pipe(flatten())
    .pipe(gulp.dest(path.dist + 'polyfills'))
    .pipe(reload());
});

// Images
gulp.task('images', function() {
  return gulp.src(globs.images)
    .pipe(imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [{removeUnknownsAndDefaults: false}]
    }))
    .pipe(gulp.dest(path.dist + 'images'))
    .pipe(reload());
});

Handlebars.registerHelper('if_eq', function(a, b, opts) {
  if(a == b) // Or === depending on your needs
    return opts.fn(this);
  else
    return opts.inverse(this);
});

// HTML Files (note: does not flatten!)
gulp.task('html', function() {
  return gulp.src(project.html)
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file',
      filters: {
        handlebars: function(content, options){
          var template = Handlebars.compile(content);
          if( options.data ) {
            try {
              var contents = fs.readFileSync( __dirname + '/' + path.source + 'data/' + options.data + '.json');
              options.data = JSON.parse(contents);
            } catch (err) {
              console.log('Error loading collection.', err);
            }
          }
          return template( options );
        }
      }
    }))
    .pipe(gulp.dest( path.dist ))
    .pipe(reload());
});

gulp.task('robots', function(){
  return gulp.src( path.source + '/html/index.html')
        .pipe(robots({
            useragent: '*',
            allow: '',
            disallow: ''
        }))
        .pipe(gulp.dest( path.dist + '/robots.txt' ));
});

// Webfont Files (includes symbols)
gulp.task('fonts', function() {
  return gulp.src(globs.fonts)
    .pipe(flatten())
    .pipe(gulp.dest(path.dist + 'fonts'))
    .pipe(reload());
});

// Custon Icon Font Builder
var fontName = 'symbols',
    template = 'symbol-font';

gulp.task('symbols', function(){

/*
  try {
    which.sync('sketchtool');
  } catch(error){
    gutil.log(error); return;
  }

  gulp.src(path.source + 'fonts/symbols/symbol-font-16px.sketch') // you can also choose 'symbol-font-16px.sketch'
    .pipe(sketch({
      export: 'artboards',
      formats: 'svg'
    ''}))
    .pipe(addsrc(path.source + 'fonts/symbols/svg/*.svg'))
*/
  gulp.src(path.source + 'fonts/symbols/svg/*.svg')
    .pipe(iconfont({
      fontName   : fontName,
      normalize  : true
    }))
    .on('codepoints', function(codepoints) {
      var options = {
        glyphs    : codepoints,
        fontName  : fontName,
        fontPath  : '../fonts/', // set path to font (from your CSS file if relative)
        className : 'ico' // set class name in your CSS
      };
      gulp.src( path.source + 'fonts/symbols/templates/' + template + '.css')
        .pipe(consolidate('lodash', options))
        .pipe(rename({ basename:fontName }))
        .pipe(gulp.dest( path.source + 'fonts/' )); // set path to export your CSS

      // if you don't need sample.html, remove next 4 lines
      gulp.src( path.source + 'fonts/symbols/templates/' + template + '.html')
        .pipe(consolidate('lodash', options))
        .pipe(rename({ basename: fontName + '-sample' }))
        .pipe(gulp.dest( path.source + 'fonts/')); // set path to export your sample HTML
    })
    .pipe(gulp.dest( path.source + 'fonts/')); // set path to export your fonts
});

// Start local express server (dev only)
gulp.task('server', function() {
  server.use(express.static( path.dist ))
  server.listen(8000)
  browserSync({
    proxy: 'localhost:8000',
    open: false,
    notify: false,
    reloadOnRestart: false
  })
});

// Reloads browserSync
function reload() {
  if (server) {
    return browserSync.reload({ stream: true })
  }
  return gutil.noop()
}

gulp.task('watch', function() {
  gulp.watch([path.source + 'html/**/*', path.source + '/data/**/*.json'], ['html']);
  gulp.watch( path.source + 'images/*', ['images']);
  gulp.watch( path.source + 'sass/**/*.scss', ['styles']);
  gulp.watch( path.source + 'scripts/*.js', ['scripts']);
  gulp.watch([path.source + 'fonts/**/*', '!' + path.source + 'fonts/symbols/**/*'], ['fonts']);
});

// ### Gulp Tasks
// Build tasks only.
gulp.task('build', function(callback) {
  runSequence( ['html', 'robots', 'images', 'styles', 'scripts', 'fonts', 'polyfills' ], callback );
});

// Clean, build and start watcher and server, in that order.
gulp.task('dev', function(callback) {
  runSequence( 'clean', 'build', ['watch', 'server'], callback );
});

gulp.task('default', ['dev']);

