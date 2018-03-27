'use strict';

// modules
var gulp = require('gulp'),
	gulpif = require('gulp-if'),
	runSequence = require('run-sequence'),
	fs = require('fs'),
	gulpconcat = require('gulp-concat'),
	watch = require('gulp-watch'),
	gutil = require('gulp-util'),
	sass = require('gulp-ruby-sass'),
	sourcemaps = require('gulp-sourcemaps'),
	prefix = require('gulp-autoprefixer'),
	browserSync = require('browser-sync').create(),
	exec = require('child_process').exec,
	stylemark = require('stylemark');
// var exec = require('child_process').exec;
// var replace = require('gulp-replace');
// var cssimport = require("gulp-cssimport");
// var uncss = require("gulp-uncss");


// configuration
var config = {
	dev: gutil.env.dev,
	src: {
		colors: {
			src: './src/scss/01-brand/colors.json',
			dist: './src/scss/01-brand/brand-core/_00-settings_colors.scss'
		},
		styles: {
			core: './src/scss/*.scss'
			// core: './src/**/*.scss'
		},
		fonts: {
			// src: './src/assets/fonts/**/*.{svg,eot,ttf,woff}',
			src: './src/assets/fonts/**/*',
			dist: '_dist/assets/'
		}
	},
	dest: '_dist'
};


// colors
// pulls JSON data and creates Sass color variables
gulp.task('colors', function() {
	var contents = require(config.src.colors.src),
		intromsg = '////////////////////////////////////////////////////////////////////////\n// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n// !!!! WARNING !!!! \n// THIS FILE (`' + config.src.colors.dist + '`)\n// IS GENERATED BY `' + config.src.colors.src + '` DO NOT EDIT THIS FILE \n// !!!! WARNING !!!!\n// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n////////////////////////////////////////////////////////////////////////\n\n\n',
		obj = intromsg,
		extendobj;

	fs.readFile(config.src.colors.src, function (err, contents) {
	  if (err) throw err;

		var data = JSON.parse(contents),
			colors = data.colors,
			colorlength = colors.length;

		for (var i = 0; i < colorlength; i++) {
			var color = colors[i],
				children = colors[i].extended,
				childrenlength = (children) ? children.length : 0,
				variablename = "";

			obj += "$" + color.name +
				   ": " + color.value + ";\n";

			if (childrenlength > 0) {
				for (var x = 0; x < childrenlength; x++) {
					obj += '$' + children[x] + ": " + "$" + color.name + ";\n";

					if (x >= (childrenlength - 1)) {
						obj += "\n"
					}
				}
			} else {
				obj += "\n"
			}

		}

		obj += "\n\n\n$palette: (\n";

		colors = colors.filter(color => color.palette )


		for (var i = 0; i < colors.length; i++) {
			var color = colors[i];

				obj += "    \"" + color.name.replace("color-", "") + "\": (\"#{$" + color.name + "}\", \"#{$" + color.name + "-contrast}\")";

				if(colors.length -1  > i) {
					obj += ", \n";
				}

		}

		obj += "\n); \n\n\n\n" + intromsg;



		fs.writeFile(config.src.colors.dist, obj);
	});
});


gulp.task('stylemark', function () {
	stylemark({
	    input: 'src/scss',
	    output: '_dist',
	    configPath: '.stylemark.yml',
	});
})

// make CSS from Sass  
gulp.task('sass', function () {
	return sass(config.src.styles.core, {
    	})
        .on('error', function (err) {
            console.error('Error!', err.message);
        })
        .pipe(prefix('last 3 version'))
   		.pipe(gulpif((config.dev && !config.simple), sourcemaps.write('maps', {
	        includeContent: false,
	        sourceRoot: '.'
	    })))
   		// .pipe(gulpif(!config.dev, csso()))
   		// .pipe(gulpif(!config.dev, csscomb()))
        .pipe(gulp.dest('_dist'));
        // .pipe(gulpif(config.dev, reload({stream:true})));
});



// fonts
gulp.task('fonts', function() {
	return gulp.src(config.src.fonts.src)
		.pipe(gulp.dest(config.src.fonts.dist + "/"));
});


// Static Server + watching scss/html files
gulp.task('serve', ['fonts', 'stylemark', 'sass'], function() {

    browserSync.init({
        server: "./_dist"
    });


	gulp.watch("src/**/*", ['stylemark']);


	gulp.watch("./src/assets/fonts/**/*", ['fonts']);

	// gulp.task('styles:static:watch', ['styles:static']);
	// gulp.watch('src/assets/toolkit/styles/**/*.css', ['styles:static:watch']);

    gulp.watch("src/scss/**/*.scss", ['sass']);
    gulp.watch("dist/**/*.html").on('change', browserSync.reload);
});



// default build task
gulp.task('default', function () {
	// define build tasks
	var tasks = [
		'fonts',
		'colors'
	];

	// run build
	runSequence(tasks, function () {
		// if (config.dev) {
			gulp.start('serve');
		// }
	});

});
