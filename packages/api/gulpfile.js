const gulp = require("gulp");
const typescript = require("gulp-typescript");
const childProcess = require("child_process");
const sourcemaps = require("gulp-sourcemaps");
const del = require("del");

const tsProject = typescript.createProject("./tsconfig.json");

const paths = {
  src: {
    scripts: {
      all: [
        "./src/**/*.ts",
        "!./**/*.spec.ts"
      ]
    }
  },
  out: {
    dev: {
      root: "./dist",
      all: "./dist/**/*"
    }
  }
}
gulp.task("clean", function() {
  return del(paths.out.dev.all)
});
gulp.task("build", gulp.series("clean", function() {
  return gulp.src(paths.src.scripts.all)
  .pipe(sourcemaps.init())
  .pipe(tsProject())
  .pipe(sourcemaps.write())
  .pipe(gulp.dest(paths.out.dev.root));
}));

let node;
gulp.task("server", function(done) {
  if (node) { node.kill(); }
  node = childProcess.spawn("node", ["dist/app.js"], {
    stdio: "inherit",
    env: {
      ...process.env,
      PORT: 8081,
    }
  });
  done();
});

gulp.task("watch", function() {
  return gulp.watch(paths.src.scripts.all, gulp.series("build", "server"));
})

gulp.task("serve", gulp.series("build", gulp.parallel("server", "watch")));

process.on("exit", function() {
  if (node) {
    node.kill();
  }
});


gulp.task("run", gulp.series("build", "serve"));