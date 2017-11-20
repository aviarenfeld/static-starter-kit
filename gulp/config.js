require('dotenv').config({ silent: true });
minimist = require('minimist');
var options = minimist(process.argv);
var environment = options.environment || options.e || 'development';
var historyApiFallback = require('connect-history-api-fallback');
var gutil = require('gulp-util');

// Output Environment:
if ( options.environment || options.e ) {
  console.log('Environment: ' + environment );
} else {
  console.log('Environment: ' + environment + ' (default)' );
}

var paths = {
  src  : './src',
  dest : './dist'
}

var options = {
  development: {
    sourcemaps: true,
    minify: false,
    uglify : false,
    development: true
  },
  production: {
    sourcemaps: false,
    minify: true,
    uglify : true,
    development: false
  }
}

console.log('environment options:');
console.log('---------------------');
console.log(options[ environment ]);
console.log('---------------------');

/* Error Handling */
var gulp     = require('gulp');
var gulp_src = gulp.src;
var plumber  = require('gulp-plumber');
gulp.src = function() {
  return gulp_src.apply(gulp, arguments)
    .pipe(plumber(function(error) {
      // Output an error message
      gutil.log(gutil.colors.red('Error (' + error.plugin + '): ' + error.message));
      // emit the end event, to properly end the task
      this.emit('end');
    })
  );
};

var webpack = require('webpack');
var path = require('path');

module.exports = {
  gulp        : gulp,
  paths        : paths,
  environment : environment,
  browserSync : {
    server : {
      baseDir: paths.dest
    },
    open   : false,
    notify : false
  },
  sass: {
    src      : paths.src + '/scss/**/*.scss',
    dest     : paths.dest + '/css',
    settings : {
      outputStyle  : environment === 'production' ? 'compressed' : 'nested',
      includePaths : path.resolve(__dirname, '../node_modules')
    }
  },
  images: {
    src  : paths.src + '/images/**',
    dest : paths.dest + '/images'
  },
  fonts : {
    src: paths.src + '/fonts/**',
    dest: paths.dest + '/fonts'
  },
  symbols: {
    name           : 'Symbols',
    src            : paths.src + '/symbols/svg/*.svg',
    dest           : paths.dest + '/fonts',
    sassDest       : paths.src + '/scss/base',
    template       : './gulp/tasks/symbols/template.sass',
    sassOutputName : '_symbols.sass',
    fontPath       : '/fonts',
    className      : 'ico',
    options        : {
      fontName         : 'symbols',
      appendCodepoints : true,
      normalize        : false
    }
  },
  scripts : {
    src    : [ paths.src + '/scripts/**/*.js' ],
    dest   : paths.dest + '/scripts',
    bundle : {
      entry : paths.dest + '/scripts/index',
      dest  : paths.dest + '/scripts/main.bundle.js'
    }
  },
  html : {
    src    : [ paths.src + '/html/**/*.html', '!' + paths.src + '/html/**/_*.html' ],
    dest   : paths.dest,
    files  : [paths.src + '/**/*.html', paths.src + '/**/*.html.partial', paths.src + '/**/*.hbs'],
    data   : paths.src + '/data',
    root   : environment === 'production' ? '/' : '/',
    GTM_ID : process.env.GTM_ID || 'GTM-XXXX'
  },
  webpack: {
    cache: true,
    entry: path.resolve(__dirname, '../') + '/src/scripts/index.js',
    output: {
      path: path.resolve(__dirname, '../') + '/dist/scripts',
      publicPath: 'dist/',
      filename: '[name].js',
      chunkFilename: '[chunkhash].js'
    },
    module: {
      rules: [
        { 
          test   : /.js$/,
          exclude: /node_modules/,
          use : [
            'babel-loader',
            'eslint-loader'
          ]
        }
      ]
    },
    plugins: [
      new webpack.ProvidePlugin({
        // Automtically detect jQuery and $ as free var in modules
        // and inject the jquery library
        // This is required by many jquery plugins
        jQuery: 'jquery',
        $: 'jquery'
      })
    ]
  }
};
