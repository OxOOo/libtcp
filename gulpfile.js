var gulp = require('gulp');
var ts = require('gulp-typescript');
var tsProj = ts.createProject('tsconfig.json', {
    typescript: require('typescript')
});
var merge = require('merge2');

gulp.task('tsc', function () {
    var tsResult = gulp.src('src/**/*.ts')
        .pipe(ts(tsProj));

    return merge([
        tsResult.dts.pipe(gulp.dest('definitions')),
        tsResult.js.pipe(gulp.dest('build'))
    ]);
});

gulp.task('tsc:w', ['tsc'], function () {
    return gulp.watch('src/**/*.ts', ['tsc']);
});

gulp.task('test', function () {
    return gulp.src('test/*.ts')
        .pipe(ts(tsProj))
        .pipe(gulp.dest('build_test'));
});