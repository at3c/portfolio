'use strict'

var gulp = require('gulp');

var jade = require('gulp-jade');
var sass = require('gulp-sass');
var imagemin = require('gulp-imagemin');
var livereload = require('gulp-livereload');
var connect = require('gulp-connect');
var wiredep = require('wiredep').stream;

var useref = require('gulp-useref');
var gulpif = require('gulp-if');
var minifyCss = require('gulp-minify-css');
var htmlmin = require('gulp-htmlmin');

//connect local server
gulp.task('connect', function() {
    connect.server({
      root: 'builds/development',
      livereload: true
    });
});

//compile and copy jade files
gulp.task('jade-dev', function(){
    return gulp.src('src/templates/**/index.jade')
      .pipe(jade({pretty:true}))
      .pipe(gulp.dest('builds/development'));
});

//reload page
gulp.task('html', function () {
    gulp.src('builds/development/*.html').pipe(connect.reload());
});

//compile adn copy sass files
gulp.task('sass-dev', function(){
    return gulp.src('src/sass/*.scss')
      .pipe(sass({sourceComments: 'map'}))
      .pipe(gulp.dest('builds/development/css'))
});

//compress and copy images
gulp.task('imagemin-dev', function() {
    return gulp.src('src/files/images/*')
      .pipe(imagemin())
      .pipe(gulp.dest('builds/development/images'))
});

//watch for changes
gulp.task('watch', ['connect'], function () {
  gulp.watch('src/templates/**/*.jade', ['jade-dev']);
  gulp.watch('src/sass/*.scss', ['sass-dev']);
  gulp.watch('src/files/images/*', ['imagemin-dev']);
  gulp.watch('builds/development/*.html', ['html']);
  gulp.watch('builds/development/css/*.css', ['html']);
  gulp.watch('builds/development/images/*', ['html']);
});

//create development project
gulp.task('dev', ['jade-dev', 'html', 'imagemin-dev', 'sass-dev']);

//create development project and add bowers components links in index.html
gulp.task('bower', function () {
  gulp.src('builds/development/index.html')
    .pipe(wiredep({
      directory: "builds/development/bower_components"
    }))
    .pipe(gulp.dest('builds/development'));
});

//copy images to production
gulp.task('image-prod', function() {
    return gulp.src('builds/development/images/*')      
      .pipe(gulp.dest('builds/production/images'))
});

//copy fonts to production
gulp.task('fonts', function() {
    return gulp.src([
                    'builds/development/bower_components/fontawesome/fonts/fontawesome-webfont.*'])
            .pipe(gulp.dest('builds/production/fonts'));
});

//create production project
gulp.task('production', ['image-prod', 'fonts'], function () {
    var assets = useref.assets();
    
    return gulp.src('builds/development/index.html')
        .pipe(assets)       
        .pipe(gulpif('*.css', minifyCss()))
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('builds/production'));
});