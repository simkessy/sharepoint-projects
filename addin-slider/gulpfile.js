var gulp = require('gulp');
var run = require('run-sequence');
var webpack = require('webpack-stream');
var $ = require('gulp-load-plugins')();
var settings = require('./app/save-settings.js')

// var target = 'C:\\Users\\Administrator\\SharePoint\\apps - Site Assets'
var target = 'C:\\Users\\Administrator\\Documents\\Visual Studio 2013\\Projects\\SPSlider\\SPSlider\\Scripts'



gulp.task('pack', function() {
  return gulp.src(['/app/loader.js'])
  .pipe(webpack( require('./webpack.config.js') ))
  // .pipe(gulp.dest('./'))
  .pipe(gulp.dest(target))
  .pipe($.spsave({
    siteUrl: settings.siteUrl,
    username: settings.username,
    password: settings.password,
    folder: "Scripts"
  }))
})

gulp.task('push', ['pack'], function() {
  return gulp.src(['./app/index.html'])
  .pipe(gulp.dest(target+"/SPSlider"))
  .pipe($.notify({
    onLast: true,
    title: 'SharePoint Push',
    message: 'Pushed to SharePoint!'
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
