/*
 * Used by `grunt` - see gruntjs.com.
 *
 * The purpose of this file is to help with working on the eden-js grammar, the
 * 'jison' task will generate the parser, the default task runs a web server
 * for testing the grammar and automatically regenerates the parser when the
 * grammar file changes.
 */

'use strict';

module.exports = function (grunt) {


  grunt.initConfig({

	'gh-pages': {
		options: {
			base: 'build',
			add: false,
			repo: 'https://github.com/knicos/synechocystis.git',
			branch: 'gh-pages',
			message: 'Deploy ConstruitScript Build'
		},
		src: ['latest/synechocystis.*','index.html','data/*','css/*']
	},

	browserify: {
		'build/latest/synechocystis.js': ['js/exports.js']
	},

	uglify: {
		core: {
			files: {
				'build/latest/synechocystis.min.js': ['build/latest/synechocystis.js']
			}
		}
	}
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-gh-pages');
  grunt.registerTask('default', ['browserify','uglify']);
};

