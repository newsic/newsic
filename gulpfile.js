// TODO: update to gulp 4 syntax

let gulp = require('gulp');
let sass = require('gulp-sass');
let cleanCSS = require('gulp-clean-css');
let rename = require('gulp-rename');
let uglify = require('gulp-uglify-es').default;

gulp.task('uglify', function () {
  return gulp.src(["newsic/static/js/*.js", "!newsic/static/js/*.min.js", "!newsic/static/js/*/*"])
      .pipe(rename({ suffix: '.min' }))
      .pipe(uglify(/* options */))
      .pipe(gulp.dest(function(f) {
        return f.base;
    }));
});

gulp.task('sass', function() {
  gulp.src(["newsic/static/css/*.scss", "!newsic/static/css/*/*"])
    .pipe(sass())
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest(function(f) {
        return f.base;
    })); 
});

gulp.task('default', ["sass", "uglify"], function() {
  gulp.watch(["newsic/static/css/*.scss", "!newsic/static/css/plyr/*"], ["sass"]);
  gulp.watch(["newsic/static/js/*.js", "!newsic/static/js/*.min.js", "!newsic/static/js/*/*"], ["uglify"]);
})
