module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-rename');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		banner:
			'/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
			'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
			'<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
			' * Copyright (c) 2012-<%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
			' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
		directories: {
			dist: 'dist/<%= pkg.version %>'
		},
		filenames: {
			full: '<%= pkg.name %>-<%= pkg.version %>.js',
			min: '<%= pkg.name %>.min.js',
			minified: '<%= pkg.name %>-<%= pkg.version %>.min.js',
			sourcemap: '<%= pkg.name %>-<%= pkg.version %>.min.map'
		},
		clean: {
			files: [ '<%= directories.dist %>', '<%= filenames.full %>', '<%= filenames.minified %>', '<%= filenames.sourcemap %>' ]
		},
		jshint: {
			options: {
				'-W093': true, // Disable "Did you mean to return a conditional instead of an assignment?" warning
				ignores: []
			}
		},
		concat: {
			options: {
				banner: '<%= banner %>',
				stripBanners: true,
				separator: '\n\n//----\n\n'
			},
			dist: {
				src: [ 'Overload.js' ],
				dest: '<%= filenames.full %>'
			}
		},
		uglify: {
			options: {
				banner: '<%= banner %>',
				sourceMap: '<%= filenames.sourcemap %>'
			},
			dist: {
				src: '<%= filenames.full %>',
				dest: '<%= filenames.minified %>'
			}
		},
		copy: {
			src: '<%= filenames.minified %>'
		},
		rename: {
			min: {
				src: 'src',
				dest: '<%= filenames.min %>'
			},
			full: {
				src: '<%= filenames.full %>',
				dest: '<%= directories.dist %>/<%= filenames.full %>'
			},
			minified: {
				src: '<%= filenames.minified %>',
				dest: '<%= directories.dist %>/<%= filenames.minified %>'
			},
			sourcemap: {
				src: '<%= filenames.sourcemap %>',
				dest: '<%= directories.dist %>/<%= filenames.sourcemap %>'
			}
		}
	});

	grunt.registerTask('default', ['clean', 'jshint', 'concat', 'uglify', 'copy', 'rename']);

};