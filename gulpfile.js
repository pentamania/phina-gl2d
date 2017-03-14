'use strict';

const BANNER = [
  "/*!",
  " * <%= pkg.name %> <%= pkg.version %>",
  // " * <%= pkg.homepage %>",
  " * ",
  " * The MIT License (MIT)",
  " * Copyright © 2017 <%= pkg.author %>",
  " * ",
  " * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and",
  " * associated documentation files (the “Software”), to deal in the Software without restriction, including",
  " * without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies",
  " * of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following",
  " * conditions:",
  " * ",
  " * The above copyright notice and this permission notice shall be included in all copies or substantial portions",
  " * of the Software.",
  " * ",
  " * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR",
  " * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,",
  " * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE",
  " * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER",
  " * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,",
  " * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN",
  " * THE SOFTWARE.",
  " */",
  "",
].join("\n");

const pkg = require("./package.json");
const gulp = require("gulp");
const banner = require("gulp-banner");
const concat = require("gulp-concat");
// const sourcemaps = require("gulp-sourcemaps");
const uglify = require("gulp-uglify");
const rename = require("gulp-rename");

const SRC_FILES = [
  "src/lib/*.js",
  "src/*.js",
];
const compressOption = {
  preserveComments: 'license',
};

const concatJS = function(minify) {
  const baseTask = () => {
    return gulp.src(SRC_FILES)
    // .pipe(plumber())
    // .pipe(sourcemaps.init())
    .pipe(concat(pkg.name))
    // .pipe(sourcemaps.write("./"))
    .pipe(banner(BANNER, { pkg: pkg }))
    ;
  };

  if (minify) {
    baseTask()
    .pipe(rename({
      extname: ".min.js"
    }))
    .pipe(uglify(compressOption))
    .pipe(gulp.dest("./build"));
  } else {
    baseTask()
    .pipe(gulp.dest("./build"));
  }
};

gulp.task("concat", function() {
  concatJS(false);
});

gulp.task("uglify", function() {
  concatJS(true);
});

gulp.task("watch", function() {
  gulp.watch("./src/**/*.*", ["concat"]);
});

gulp.task("default", ["uglify"]);