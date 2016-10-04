var gulp = require('gulp');
var run = require('run-sequence');
var webpack = require('webpack-stream');
var $ = require('gulp-load-plugins')();
var settings = require('./spsave.js')

var target = 'dist'

gulp.task('pack', function() {
  return gulp.src(['/app/loader.js'])
  .pipe(webpack( require('./webpack.config.js') ))
  .pipe(gulp.dest(target))
  // .pipe($.spsave({
  //   siteUrl: settings.siteUrl,
  //   username: settings.username,
  //   password: settings.password,
  //   folder: "SiteAssets/large-file-upload"
  // }))
})

gulp.task('push', ['pack'], function() {
  return gulp.src(['./app/index.html'])
  // .pipe($.spsave({
  //   siteUrl: settings.siteUrl,
  //   username: settings.username,
  //   password: settings.password,
  //   folder: "SiteAssets/large-file-upload"
  // }))
  .pipe($.notify({
      onLast: true,
      title: 'SharePoint Push',
  }))
})


gulp.task('default', function(callback) {
  run('push',
    callback);
});


//Run task runner on any change or new file
gulp.task('watch',function(){
  $.watch(['app/**/*'],function(files,cb){
    gulp.start('push', cb);
  })
})
