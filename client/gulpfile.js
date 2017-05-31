var gulp = require('gulp');
// js
var concat = require('gulp-concat');
var deporder = require('gulp-deporder');
var stripdebug = require('gulp-strip-debug');
var uglify = require('gulp-uglify');
// css
var cleanCss = require('gulp-clean-css');
// html
var htmlReplace = require('gulp-html-replace');
var htmlClean = require('gulp-htmlclean');

var folder = {
  src: 'src/',
  web: 'client-web/build/',
  app: 'client-app/www/'
};

gulp.task('js-web', function() {
  return gulp.src([
      folder.src + 'js/jquery-3.2.1.min.js',
      folder.src + 'js/bootstrap.min.js',
    folder.src + 'js/connect5-core.js',
    folder.src + 'js/connect5-web.js'
  ]).pipe(deporder())
    .pipe(concat('main.min.js'))
    .pipe(stripdebug())
    .pipe(uglify())
    .pipe(gulp.dest(folder.web + 'js/'));
});

gulp.task('js-app', function() {
  return gulp.src([
    folder.src + 'js/jquery-3.2.1.min.js',
    folder.src + 'js/bootstrap.min.js',
    folder.src + 'js/connect5-core.js',
    folder.src + 'js/connect5-app.js'
  ]).pipe(deporder())
    .pipe(concat('main.min.js'))
    .pipe(stripdebug())
    .pipe(uglify())
    .pipe(gulp.dest(folder.app + 'js/'));
});

gulp.task('css-web', function () {
  return gulp.src(folder.src + 'css/*')
    .pipe(concat('stylesheet.min.css'))
    .pipe(cleanCss())
    .pipe(gulp.dest(folder.web + 'css/'));
});

gulp.task('css-app', function () {
  return gulp.src(folder.src + 'css/*')
    .pipe(concat('stylesheet.min.css'))
    .pipe(cleanCss())
    .pipe(gulp.dest(folder.app + 'css/'));
});

gulp.task('fonts-web', function () {
  return gulp.src(folder.src + 'fonts/*')
    .pipe(gulp.dest(folder.web + 'fonts/'));
});

gulp.task('images-web', function () {
  return gulp.src(folder.src + 'images/*')
    .pipe(gulp.dest(folder.web + 'images/'));
});

gulp.task('fonts-app', function () {
  return gulp.src(folder.src + 'fonts/*')
    .pipe(gulp.dest(folder.web + 'fonts/'));
});

gulp.task('html-web', function () {
  return gulp.src(folder.src + '/index.html')
    .pipe(htmlReplace({
      'css': 'css/stylesheet.min.css',
      'js': 'js/main.min.js'
    }))
    .pipe(htmlClean())
    .pipe(gulp.dest(folder.web + '/'));
});

gulp.task('html-app', function () {
  return gulp.src(folder.src + '/index.html')
    .pipe(htmlReplace({
      'css': 'css/stylesheet.min.css',
      'js': 'js/main.min.js',
      'app-js': 'cordova.js'
    }))
    .pipe(htmlClean())
    .pipe(gulp.dest(folder.web + '/'));
});

gulp.task('build-web', ['fonts-web', 'css-web', 'js-web', 'html-web', 'images-web']);
gulp.task('build-app', ['fonts-app', 'css-app', 'js-app', 'html-app']);
