var gulp = require('gulp');
// js
var concat = require('gulp-concat');
var deporder = require('gulp-deporder');
var stripdebug = require('gulp-strip-debug');
var uglify = require('gulp-uglify');
// css
var cleanCss = require('gulp-clean-css');
//html
var htmlClean = require('gulp-htmlclean');

var folder = {
  src: 'src/',
  build: 'build/'
};

gulp.task('js', function() {
  return gulp.src([
      folder.src + 'js/jquery-3.2.1.min.js',
      folder.src + 'js/bootstrap.min.js',
      folder.src + 'js/*'
  ]).pipe(deporder())
    .pipe(concat('main.min.js'))
    .pipe(stripdebug())
    .pipe(uglify())
    .pipe(gulp.dest(folder.build + 'js/'));
});

gulp.task('css', function () {
  return gulp.src(folder.src + 'css/*')
    .pipe(concat('stylesheet.min.css'))
    .pipe(cleanCss())
    .pipe(gulp.dest(folder.build + 'css/'));
});

gulp.task('fonts', function () {
  return gulp.src(folder.src + 'fonts/*')
    .pipe(gulp.dest(folder.build + 'fonts/'));
});

gulp.task('html', function () {
  return gulp.src(folder.src + '/index.html')
    .pipe(htmlClean())
    .pipe(gulp.dest(folder.build + '/'));
});

gulp.task('run', ['fonts', 'css', 'js', 'html']);