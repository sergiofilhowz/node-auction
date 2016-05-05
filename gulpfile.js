var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    sass = require('gulp-sass'),
    minifyCss = require('gulp-minify-css'),
    templateCache = require('gulp-angular-templatecache'),
    merge = require('merge-stream'),
    wiredep = require('wiredep'),
    templateCacheConfig;

templateCacheConfig = {
    standalone : true,
    module : 'auction.tpls'
};

function logError(err) {
    'use strict';
    console.log('[ERROR]: ' + err.message, err.lineNumber);
}

gulp.task('vendor', () => {
    'use strict';

    var vendor = wiredep();

    gulp.src(vendor.js)
        .pipe(concat('vendor.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./public/scripts'));

    gulp.src(vendor.css)
        .pipe(concat('vendor.min.css'))
        .pipe(minifyCss({ compatibility : 'ie8' }))
        .pipe(gulp.dest('./public/styles'));

});

gulp.task('script', () => {
    'use strict';

    var scripts = gulp.src([
        'src/angular/**/*.module.js',
        'src/angular/**/*.js',
        '!src/angular/**/*.spec.js'
    ]).pipe(sourcemaps.init())
        .pipe(concat('auction.js'))
        .pipe(uglify())
        .on('error', logError);

    var templates = gulp.src('src/angular/**/*.html')
        .pipe(templateCache(templateCacheConfig));

    merge(scripts, templates)
        .pipe(concat('auction.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./public/scripts'));
});

gulp.task('style', () => {
    'use strict';

    gulp.src(['src/angular/**/*.sass'])
        .pipe(sourcemaps.init())
            .pipe(sass({ style: 'compressed' }).on('error', sass.logError))
            .pipe(concat('auction.css'))
            .pipe(minifyCss({ compatibility : 'ie8' }))
            .pipe(sourcemaps.write())
        .pipe(gulp.dest('./public/styles'));
});

gulp.task('languages', () => {
    'use strict';

    gulp.src(['src/languages/*.json'])
        .pipe(gulp.dest('./public/languages'));
});

gulp.task('icons', () => {
    'use strict';

    gulp.src(['src/icons/*.svg', 'src/icons/*.png'])
        .pipe(gulp.dest('./public/icons'));
});

gulp.task('watch', () => {
    'use strict';
    gulp.watch(['src/angular/**/*.js', 'src/angular/**/*.html'], ['script']);
    gulp.watch('src/angular/**/*.sass', ['style']);
    gulp.watch('src/languages/*.json', ['languages']);
});

gulp.task('default', ['vendor', 'script', 'style', 'languages', 'icons']);