const gulp = require("gulp");
const typescript = require("gulp-typescript");
const nodemon = require("nodemon");

const paths = {
  src: {
    scripts: {
      all: "./src/**/*.ts"
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
  .pipe(typescript())
  .pipe(gulp.dest(paths.out.dev.root));
});

gulp.task("serve", function() {
  process.env.PORT = "8081";
  const stream = nodemon({
    script: "dist/app.js",
    watch: ["!*.*"]
  });

  let watchStream;  
  return stream
    .on('start', function() {
      watchStream = gulp.watch(paths.src.scripts.all,
        gulp.series(
          gulp.task("build"),
          function() { stream.emit('restart'); }
        ));    
      console.log("Application has started.");
    })
    .on('restart', function() {
      console.log("Application is restarting.");
    })
    .on('crash', function() {
      console.error('Application has crashed!\n')
        stream.emit('restart', 2)
    })
    .on('exit', function() {
      watchStream.emit('end', 0);
    });
});


gulp.task("run", gulp.series("build", "serve"));