const gulp = require("gulp");
const concat = require("gulp-concat");
const del = require("del");
const buffer = require("vinyl-buffer");
const sourcemaps = require("gulp-sourcemaps");
const inject = require("gulp-inject");
const browserify = require("browserify");
const source = require("vinyl-source-stream");
const tsify = require("tsify");
const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
const connect = require("gulp-connect");
const babelify = require("babelify");
const log = require("fancy-log");
const open = require("gulp-open");
const minimist = require("minimist");
const ftp = require("vinyl-ftp");
const debug = require("gulp-debug");
const args = minimist(process.argv.slice(2));
const paths = {
  src: {
    root: "./src",
    all: "./src/**/*",
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
      all: [
        "./src/**/*.scss"
      ]
    },
    static: {
      all: "./src/static/**/*"
    }
  },
  out: {
    dev: {
      root: "./dist",
      all: "./dist/**/*",
      scripts: {
        root: "./dist/js",
        all: [
          './dist/js/*.js',
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
      },
      static: {
        root: "./dist/static"
      }
    }
  }
}

function errorHandler(err) {
  log.error(err);
  console.log(err);
  console.log("**********************************************************************************");
  this.emit("end");
}

gulp.task("sass", () => {
  return gulp.src(paths.src.sass.all)
  .pipe(sourcemaps.init())
  .pipe(concat('bundle.scss'))
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
  }).plugin(tsify).transform(babelify, {extensions: [".jsx",".js",".tsx",".ts"]});

  return bundler.bundle()
  .on('error', errorHandler)
  .pipe(source('app.js'))
  .pipe(buffer())
  .pipe(sourcemaps.init({loadMaps: true}))
  .on('error', errorHandler)
  .pipe(sourcemaps.write('./'))
  .pipe(gulp.dest(paths.out.dev.scripts.root));
});

function doCopy(type) {
  return gulp.src(paths.src[type].all).pipe(gulp.dest(paths.out.dev[type].root));
}
gulp.task("clean", () => {
  return del(paths.out.dev.all);
});
gulp.task("copy:html", () => {
  return doCopy("html");
});

gulp.task("copy:static", () => {
  return doCopy("static");
})

gulp.task("inject:index", () => {
  const injectables = {
    scripts: gulp.src(paths.out.dev.scripts.all, { read: false }),
    style: gulp.src(paths.out.dev.css.all, { read: false })
  };
  gulp.src("./dist/**").pipe(debug());
  return gulp
    .src(paths.out.dev.html.index)
    .pipe(inject(injectables.scripts, { relative: true }))
    .pipe(inject(injectables.style, { relative: true }))
    .pipe(gulp.dest(paths.out.dev.root));
});

gulp.task("build", 
  gulp.series(
    gulp.parallel("sass","bundle","copy:html","copy:static"),
    "inject:index"
  ));

gulp.task("serve", gulp.series("build", function() {
  connect.server({
    root: "./dist",
    fallback: "./dist/index.html"
  });

  gulp.src("./").pipe(open({
    uri: "http://localhost:8080/"
  }));

  gulp.watch(paths.src.all, gulp.series("build"));
}));

gulp.task("deploy", function() {
  const {host, user, password, path} = args;
  function required(args) {
    Object.keys(args).forEach(argument => {
      if (!args[argument]) {
        throw new Error(`web-client.gulp.deploy: Missing arg ${argument}, aborting!`);
      }
    })
  }

  required({host, user, password, path});

  const connection = ftp.create({
    host,
    user,
    password,
    debug: true
  });
  return connection.clean(`${path}**`, "./dist/")
  .pipe(gulp.src("./dist/**"))
  .pipe(connection.dest(path));
});