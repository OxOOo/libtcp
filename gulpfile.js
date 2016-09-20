var gulp = require('gulp');
var ts = require('gulp-typescript');
var tsProj = ts.createProject('tsconfig.json');

gulp.task('tsc', function () {
    gulp.src('src/**/*.ts')
        .pipe(ts(tsProj))
        .pipe(gulp.dest('build'));
});

gulp.task('tsc:w', ['tsc'], function () {
    gulp.watch('src/**/*.ts', ['tsc']);
});