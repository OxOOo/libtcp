let gulp = require('gulp');
let ts = require('gulp-typescript');
let tsProj = ts.createProject('tsconfig.json', {
    typescript: require('typescript')
});
let merge = require('merge2');

gulp.task('tsc', function () {
    let tsResult = gulp.src('src/**/*.ts')
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

gulp.task('example', function () {
    let tsResult = gulp.src('example/*.ts')
        .pipe(ts(tsProj));

    return tsResult.js.pipe(gulp.dest('build_example'));
});