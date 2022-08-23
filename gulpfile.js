import gulp from 'gulp';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import del from 'del';
import svgo from 'gulp-svgmin';
import svgstore from 'gulp-svgstore';
import squoosh from 'gulp-libsquoosh';
import browser from 'browser-sync';
import htmlmin from 'gulp-htmlmin';
import compress from 'gulp-minify';


// HTMl

// gulp.task('minify', () => {
//   return gulp.src('source/*.html')
//     .pipe(htmlmin({ collapseWhitespace: true }))
//     .pipe(gulp.dest('build'));
// });

// JS
// gulp.task('compress', function() {
//   gulp.src('source/*.js')
//     .pipe(minify())
//     .pipe(gulp.dest('build'))
// });

// Styles

export const styles = () => {
  return gulp.src('source/less/style.less', { sourcemaps: true })
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

// StylesMin

const stylesMin = () => {
  return gulp.src('source/less/style.less', { sourcemaps: true })
  .pipe(plumber())
  .pipe(less())
  .pipe(postcss([
  autoprefixer(),
  csso()
  ]))
  .pipe(rename('style.min.css'))
  .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
  .pipe(browser.stream());
  }

// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Watcher

const watcher = () => {
  gulp.watch('source/less/**/*.less', gulp.series(styles));
  gulp.watch('source/*.html').on('change', browser.reload);
}

// Copy


const copy = (done) => {
gulp.src([
'source/fonts/*.{woff2,woff}',
'source/*.ico',
'source/*.html',
'source/*.webmanifest',
'source/*.js'
], {
base: 'source'
})
.pipe(gulp.dest('build'))
done();
}

// Clean

export const clean = () => {
return del('build');
};

// SVG

const svg = () =>
gulp.src(['source/img/**/*.svg', '!source/img/icons/*.svg', '!source/img/*.svg'])
.pipe(svgo())
.pipe(gulp.dest('build/img'));

const sprite = () => {
return gulp.src('source/img/icons/*.svg')
.pipe(svgo())
.pipe(svgstore({
inlineSvg: true
}))
.pipe(rename('sprite.svg'))
.pipe(gulp.dest('build/img'));
}

// Images

const optimizeImages = () => {
return gulp.src('source/img/**/*.{png,jpg}')
.pipe(squoosh())
.pipe(gulp.dest('build/img'))
}

const copyImages = () => {
return gulp.src('source/img/**/*.{png,jpg}')
.pipe(gulp.dest('build/img'))
}

// WebP

const createWebp = () => {
return gulp.src('source/img/**/*.{png,jpg}')
.pipe(squoosh({
webp: {}
}))
.pipe(gulp.dest('build/img'))
}

// Build

export const build = gulp.series(
clean,
copy,
// htmlmin,
optimizeImages,
gulp.parallel(
stylesMin,
svg,
sprite,
createWebp
));

// // Default

export default gulp.series(
clean,
copy,
// htmlmin,
copyImages,
gulp.parallel(
stylesMin,
svg,
sprite,
createWebp
),
gulp.series(
server,
watcher
));
