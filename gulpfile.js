const gulp = require('gulp');

const del = require('del');
const path = require('path');

const uglify = require('gulp-uglify');
const tsComp = require('gulp-typescript');
const imagemin = require('gulp-imagemin');
const concat = require('gulp-concat');
const sass = require('gulp-sass');
const babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');

const browserSync = require('browser-sync').create();

const deleteFile = (filepath) => {
	const filePathFromSrc = path.relative(path.resolve('src'), filepath);
	console.log(filePathFromSrc);
	// Concatenating the 'build' absolute path used by gulp.dest in the scripts task
	const destFilePath = path.resolve('dist', filePathFromSrc);
	console.log(destFilePath);
	del.sync(destFilePath);
};

// prettier-ignore
const paths = {
	// SRC
	src: {
		main: './src',
		get pages () {return this.main + '/**/*.html'},
		get js_scripts () {return this.main + '/script/**/*.js'},
		get styles () {return this.main + '/style/**/*.scss'},
		get ts () {return this.main + '/script/ts/**/*.ts'},
		get ts_comp () {return this.main + '/script/ts'},
		get images () {return this.main + '/img/*'}
	},

	// DIST
	dist: {
		main: './dist',
		get scripts () {return this.main + '/js'},
		get styles () {return this.main + '/css'},
		get images () {return this.main + '/img'}
	},
},
src = paths.src,
dist = paths.dist;

// Compile TS files to vanilla JS
gulp.task('tsCompile', async () => {
	gulp.src(src.ts)
		.pipe(tsComp())
		.pipe(gulp.dest(src.ts_comp))
		.pipe(browserSync.stream());
});

// Optimize images for dist
gulp.task('imgMin', async () => {
	gulp.src(src.images)
		.pipe(imagemin())
		.pipe(gulp.dest(dist.images))
		.pipe(browserSync.stream());
});

// Copy html from dev to final build as-is
gulp.task('htmlCopy', async () => {
	gulp.src(src.pages).pipe(gulp.dest(dist.main));
});

// Compile Sass to minified CSS
gulp.task('sass', async () => {
	gulp.src(src.styles)
		.pipe(sourcemaps.init())
		.pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(dist.styles))
		.pipe(browserSync.stream());
});

// Join all JS files into single JS file, then compress it
gulp.task('comp_js', async () => {
	gulp.src(src.js_scripts)
		.pipe(sourcemaps.init())
		.pipe(concat('app.js'))
		.pipe(uglify())
		.pipe(
			babel({
				presets: ['@babel/env'],
			})
		)
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(dist.scripts))
		.pipe(browserSync.stream());
});

// Watch and execute all commands
gulp.task('watch', async () => {
	console.log('Starting Watch...');
	gulp.watch(src.styles, gulp.series('sass'));
	gulp.watch(src.pages, gulp.series('htmlCopy'));
	gulp.watch(src.ts, gulp.series('tsCompile', 'comp_js'));
	gulp.watch(src.js_scripts, gulp.series('comp_js'));
});

gulp.task('serve', async () => {
	browserSync.init({
		server: {
			baseDir: dist.main,
		},
	});
	gulp.watch(src.pages, gulp.series('htmlCopy'))
		.on('change', browserSync.reload)
		.on('unlink', (filepath) => {
			deleteFile(filepath);
		});
	gulp.watch(src.styles, gulp.series('sass'));
	// watch image folder, if deleted in src, it will also be deleted in dist
	gulp.watch(src.images, gulp.series('imgMin')).on('unlink', (filepath) => {
		deleteFile(filepath);
	});
	gulp.watch(src.ts, gulp.series('tsCompile', 'comp_js'));
	gulp.watch(src.js_scripts, gulp.series('comp_js'));
});

gulp.task('default', gulp.series('serve'));

gulp.task('taskTester', async () => {});
