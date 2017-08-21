"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var mqpacker = require("css-mqpacker");
var minify = require("gulp-csso");
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
var svgstore = require("gulp-svgstore");
var svgmin = require("gulp-svgmin");
var csscomb = require('gulp-csscomb');
var server = require("browser-sync").create();
var deploy = require('gulp-gh-pages');
var run = require("run-sequence");
var del = require("del");

gulp.task("style", function() {
    gulp.src("sass/style.scss")
        .pipe(plumber())
        .pipe(sass())
        .pipe(postcss([
            autoprefixer({browsers: ["last 2 versions"]}),
            mqpacker({
                sort: true
            })
        ]))
        .pipe(csscomb())
        .pipe(gulp.dest("./css"))
        .pipe(minify())
        .pipe(rename("style.min.css"))
        .pipe(gulp.dest("./css"))
        .pipe(server.stream());
});

gulp.task("images", function() {
    return gulp.src("docs/img/**/*.{png, jpg, gif}")
        .pipe(imagemin([
            imagemin.optipng({optimizationLevel: 3}),
            imagemin.jpegtran({progressive: true})
        ]))
        .pipe(gulp.dest("docs/img"));
});

gulp.task("symbols", function() {
    // return gulp.src("./img/*.svg")
    //     .pipe(svgmin())
    //     .pipe(gulp.dest('./out'));
    return gulp.src("./img/*.svg")
    .pipe(svgmin())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("symbols.svg"))
    .pipe(gulp.dest("./img"));
});

gulp.task("beautify", function () {
    return gulp.src("sass/**/*.scss")
        .pipe(csscomb())
        .pipe(gulp.dest("sass"));
});

gulp.task("serve", function() {
  server.init({
    server: "."
  });

  gulp.watch("sass/**/*.{scss,sass}", ["style"]);
  gulp.watch("*.html").on("change", server.reload);
});

/**
 * Push build to gh-pages
 */
gulp.task('deploy', function () {
  return gulp.src("./dist/**/*")
    .pipe(deploy())
});

gulp.task("build", function(fn) {
  run(
    "clean",
    "beautify",
    "copy",
    "style",
    "images",
    "symbols",
    fn
  );
});



gulp.task("copy", function () {
  return gulp.src([
    "fonts/**/*.{woff,woff2}",
    "img/**",
    "js/**",
    "*.html"
    ], {
      base: "."
    })
    .pipe(gulp.dest("docs"));
});

gulp.task("clean", function() {
  return del("docs");
});
