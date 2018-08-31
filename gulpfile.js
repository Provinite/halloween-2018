const gulp = require("gulp");
const concat = require("gulp-concat");
const buffer = require("vinyl-buffer");
const typescript = require("gulp-typescript");
const babel = require("gulp-babel");
const sourcemaps = require("gulp-sourcemaps");
const inject = require("gulp-inject");
const browserify = require("browserify");
const source = require("vinyl-source-stream");
const tsify = require("tsify");
const debug = require("gulp-debug");
const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
const connect = require("gulp-connect");
const babelify = require("babelify");
const log = require("fancy-log");

const paths = {
  src: {
    root: "./src",
    scripts: {
      all: [
        './src/**/*.ts',
        './src/**/*.tsx',
        '!./src/**/*.spec.ts',
        '!**/node_modules/**'
      ],
      entry: [
        "./src/app.tsx"
      ]
    },
    html: {
      index: './src/index.html',
      all: './src/**/*.html',
    },
    sass: {
      all: "./src/**/*.scss"
    }
  },
  out: {
    dev: {
      root: "./dist",
      scripts: {
        root: "./dist/js",
        all: [
          './dist/**/*.js',
        ]
      },
      html: {
        root: "./dist",
        index: "./dist/index.html",
        all: "./dist/**/*.html"
      },
      css: {
        root: "./dist/css",
        all: "./dist/**/*.css"
      }
    }
  }
}

gulp.task("build", ["sass","bundle","copy:html","inject:index"]);

function errorHandler(err) {
  log.error(err);
  this.emit("end");
}

gulp.task("sass", () => {
  gulp.src(paths.src.sass.all)
  .pipe(sourcemaps.init())
  .pipe(sass())
  .pipe(autoprefixer())
  .pipe(concat('bundle.css'))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest(paths.out.dev.css.root));
});

gulp.task("bundle", () => {
  const bundler = browserify({
    debug: true,
    entries: paths.src.scripts.entry
  }).plugin(tsify).transform(babelify);

  return bundler.bundle()
  .on('error', errorHandler)
  .pipe(source('app.js'))
  .pipe(buffer())
  .pipe(sourcemaps.init({loadMaps: true}))
  .on('error', errorHandler)
  .pipe(sourcemaps.write('./'))
  .pipe(gulp.dest(paths.out.dev.scripts.root));
})

gulp.task("copy:html", () => {
  return gulp
    .src(paths.src.html.all)
    .pipe(gulp.dest(paths.out.dev.root))
});

gulp.task("inject:index", ["bundle","copy:html","sass"], () => {
  const injectables = {
    scripts: gulp.src(paths.out.dev.scripts.all, { read: false }),
    style: gulp.src(paths.out.dev.css.all, { read: false })
  };
  return gulp
    .src(paths.out.dev.html.index)
    .pipe(inject(injectables.scripts, { relative: true }))
    .pipe(inject(injectables.style, { relative: true }))
    .pipe(gulp.dest(paths.out.dev.root));
});

gulp.task("serve", () => {
  connect.server({
    root: "./dist",
  });

  gulp.watch(paths.src.scripts.all, ["copy:html","inject:index","bundle"]);
  gulp.watch(paths.src.sass.all, ["sass"])
});