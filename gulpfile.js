var gulp         = require('gulp'),
    browserSync  = require('browser-sync'),
    jade         = require('gulp-jade'),
    stylus       = require('gulp-stylus'),
    sourcemaps   = require('gulp-sourcemaps'),
    concat       = require('gulp-concat'),
    uglify       = require('gulp-uglifyjs'),
    cssnano      = require('gulp-cssnano'),
    rename       = require('gulp-rename'),
    del          = require('del'),
    imagemin     = require('gulp-imagemin'),
    pngquant     = require('imagemin-pngquant'),
    cache        = require('gulp-cache'),
    autoprefixer = require('gulp-autoprefixer'),
    rupture      = require('rupture');

gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: 'app'
    },
    notify: false
  });
});

gulp.task('jade', function() {
  return gulp.src('app/jade/**/*.jade')
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest('app'))
    .pipe(browserSync.reload({
      stream: true
    }));
})

gulp.task('stylus', function () {
  return gulp.src(['app/stylus/main.styl', 'app/stylus/libraries.styl'])
    .pipe(sourcemaps.init())
    .pipe(stylus({
      'include css': true,
      use: [rupture()]
    }))
    .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {
      cascade: true
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('app/css'));
});

gulp.task('scripts', function() {
  return gulp.src([
      'app/libs/jquery/dist/jquery.min.js'
    ])
    .pipe(concat('libraries.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('app/js'));
});

gulp.task('css-libs', ['stylus'], function() {
  return gulp.src('app/css/libraries.css')
    .pipe(sourcemaps.init())
    .pipe(cssnano())
    .pipe(sourcemaps.write('.'))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('optimize-img', function() {
  return gulp.src('app/img/**/*')
    .pipe(cache(imagemin({
      interlaced: true,
      progressive: true,
      svgoPlugins: [{
        removeViewBox: false
      }],
      use: [pngquant()]
    })))
    .pipe(gulp.dest('public/img'));
});

gulp.task('clear-cache', function() {
  return cache.clearAll();
});

gulp.task('clean-libs', function() {
  del.sync(['app/css/**/*', '!app/css/main.css']);
  return del.sync('app/js/libraries.min.js');
});

gulp.task('clean', function() {
  return del.sync('public');
});

gulp.task('watch', ['clean-libs', 'browser-sync', 'jade', 'css-libs', 'scripts'], function() {
  gulp.watch('app/jade/**/*.jade', ['jade']);
  gulp.watch('app/stylus/**/*.styl', ['css-libs']);
  gulp.watch('app/js/**/*.js', browserSync.reload);
});

gulp.task('build', ['clean', 'optimize-img', 'stylus', 'scripts'], function() {
  var buildCss = gulp.src([
    'app/css/main.css',
    'app/css/libraries.min.css'
  ]).pipe(gulp.dest('public/css'));
  var buildFonts = gulp.src('app/fonts/**/*')
    .pipe(gulp.dest('public/fonts'));
  var buildJs = gulp.src('app/js/**/*.js')
    .pipe(gulp.dest('public/js'));
  var buildHtml = gulp.src('app/*.html')
    .pipe(gulp.dest('public'));
});