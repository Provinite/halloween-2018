const gulp = require("gulp");
const typescript = require("gulp-typescript");
const childProcess = require("child_process");

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
      root: "./dist"
    }
  }
}

gulp.task("build", function() {
  return gulp.src(paths.src.scripts.all)
  .pipe(tsProject())
  .pipe(gulp.dest(paths.out.dev.root));
});

let node;
gulp.task("server", function(done) {
  process.env.PORT = "8081";
  if (node) { node.kill(); }
  node = childProcess.spawn("node", ["dist/app.js"], { stdio: "inherit" });
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