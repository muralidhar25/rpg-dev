/// <binding Clean='vendor-bundle, default, watch, app-bundle' ProjectOpened='default' />
/*
This file is the main entry point for defining Gulp tasks and using Gulp plugins.
Click here to learn more. https://go.microsoft.com/fwlink/?LinkId=518007
*/

//npm install gulp-angular-templatecache --save-dev
//npm install gulp-htmlmin --save-dev

//npm install gulp-rename --save-dev
//npm install gulp-uglify --save-dev
//npm install gulp-sourcemaps --save-dev

'use strict';

var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');

var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var plumber = require('gulp-plumber');
var merge = require('merge-stream');
var sourcemaps = require('gulp-sourcemaps');
var templateCache = require('gulp-angular-templatecache');

var templateSrc = 'wwwroot/views/**/*.html';
var appSrc = 'wwwroot/js/**/*.js';

var vendorSrc = ['bower_components/lodash/dist/lodash.js', 'bower_components/jquery/dist/jquery.js', 'bower_components/jquery-ui/jquery-ui.js', 'bower_components/jquery-ui-touch-punch/jquery.ui.touch-punch.js', 'bower_components/gridstack/dist/gridstack.js', 'bower_components/angular/angular.js', 'bower_components/angular-animate/angular-animate.js', 'bower_components/angular-dialog-service/dist/dialogs.js', 'bower_components/angular-bootstrap/ui-bootstrap-tpls.js', 'bower_components/angular-touch/angular-touch.js', 'bower_components/angular-messages/angular-messages.js', 'bower_components/angular-ui-tab-scroll/angular-ui-tab-scroll.js', 'bower_components/angular-ui-router/release/angular-ui-router.js', 'bower_components/angular-ui-sortable/sortable.js', 'bower_components/angular-ui-select/dist/select.js', 'bower_components/angular-ui-tinymce/src/tinymce.js', 'bower_components/angular-sanitize/angular-sanitize.js', 'bower_components/angular-spectrum-colorpicker/dist/angular-spectrum-colorpicker.js', 'bower_components/angularjs-toaster/toaster.js', 'bower_components/breeze-client/build/breeze.debug.js', 'bower_components/breeze-client/build/adapters/breeze.bridge.angular.js', 'bower_components/breeze-client-labs/breeze.savequeuing.js', 'bower_components/ng-file-upload/ng-file-upload.js', 'bower_components/ng-pageslide/dist/angular-pageslide-directive.js', 'bower_components/ngImgCrop/compile/unminified/ng-img-crop.js', 'bower_components/ngstorage/ngStorage.js', 'bower_components/number-format.js/lib/format.js', 'bower_components/spectrum/spectrum.js', 'bower_components/tinymce/tinymce.js', 'bower_components/tinymce/plugins/advlist/plugin.js', 'bower_components/tinymce/plugins/anchor/plugin.js', 'bower_components/tinymce/plugins/autolink/plugin.js', 'bower_components/tinymce/plugins/charmap/plugin.js', 'bower_components/tinymce/plugins/code/plugin.js', 'bower_components/tinymce/plugins/colorpicker/plugin.js', 'bower_components/tinymce/plugins/contextmenu/plugin.js', 'bower_components/tinymce/plugins/directionality/plugin.js', 'bower_components/tinymce/plugins/emoticons/plugin.js', 'bower_components/tinymce/plugins/hr/plugin.js', 'bower_components/tinymce/plugins/insertdatetime/plugin.js', 'bower_components/tinymce/plugins/link/plugin.js', 'bower_components/tinymce/plugins/lists/plugin.js', 'bower_components/tinymce/plugins/nonbreaking/plugin.js', 'bower_components/tinymce/plugins/paste/plugin.js', 'bower_components/tinymce/plugins/searchreplace/plugin.js', 'bower_components/tinymce/plugins/table/plugin.js', 'bower_components/tinymce/plugins/template/plugin.js', 'bower_components/tinymce/plugins/textcolor/plugin.js', 'bower_components/tinymce/plugins/textpattern/plugin.js', 'bower_components/tinymce/plugins/visualblocks/plugin.js', 'bower_components/tinymce/plugins/visualchars/plugin.js', 'bower_components/tinymce/themes/modern/theme.js'];

gulp.task('default', function () {
    gulp.start('watch');
});

gulp.task('watch', function () {
    gulp.watch([templateSrc, appSrc], ['app-bundle']);
    gulp.watch([vendorSrc], ['vendor-bundle']);
});

gulp.task('vendor-bundle', function () {
    return gulp.src(vendorSrc, { base: 'bower_components/' }).pipe(plumber()).pipe(sourcemaps.init({ largeFile: true })).pipe(concat('vendor.js')).pipe(gulp.dest('wwwroot/dist')).pipe(rename("vendor.min.js")).pipe(uglify()).pipe(sourcemaps.write("./", {
        sourceMappingURL: function sourceMappingURL(file) {
            return file.relative + '.map?v=' + new Date().getTime();
        }
    })).pipe(gulp.dest("Scripts/dist"));
});

gulp.task('app-bundle', function () {

    var templates = gulp.src(templateSrc).pipe(plumber()).pipe(htmlmin({ collapseWhitespace: true })).pipe(templateCache({
        module: 'rpgsmith-templates',
        root: '/views',
        standalone: false
    }));

    var app = gulp.src(appSrc, { base: 'wwwroot/' });

    return merge(app, templates).pipe(sourcemaps.init({ largeFile: true })).pipe(concat('app.js')).pipe(gulp.dest('wwwroot/dist')).pipe(rename("app.min.js")).pipe(uglify()).pipe(sourcemaps.write("./", {
        sourceMappingURL: function sourceMappingURL(file) {
            return file.relative + '.map?v=' + new Date().getTime();
        }
    })).pipe(gulp.dest("wwwroot/dist"));
});

