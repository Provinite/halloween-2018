const gulp = require("gulp");
const typescript = require("gulp-typescript");
const nodemon = require("gulp-nodemon");

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

gulp.task("run", function() {
  var stream = nodemon({
    script: "dist/app.js",
    tasks: ['build']
  });
 
  stream
    .on('restart', function () {
      console.log('restarted!')
    })
    .on('crash', function() {
      console.error('Application has crashed!\n')
        stream.emit('restart', 2)
    });
});
