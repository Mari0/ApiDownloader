module.exports = function (grunt) {
	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),
		concat : {
			options : {
				// define a string to put between each file in the concatenated output
				separator : ';'
			},
			dist : {
				// the files to concatenate
				src : ['js/*.js'],
				// the location of the resulting JS file
				dest : 'dist/<%= pkg.name %>.js'
			}
		},
		uglify : {
			options : {
				// the banner is inserted at the top of the output
				'banner' : '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
			},
			dist : {
				files : {
					'dist/<%= pkg.name %>.min.js' : ['<%= concat.dist.dest %>']
				}
			}
		},
		jshint : {
			// define the files to lint
			files : ['gruntfile.js', 'js/*.js', 'test/**/*.js'],
			// configure JSHint (documented at http://www.jshint.com/docs/)
			options : {
				// more options here if you want to override JSHint defaults
				globals : {
					jQuery : true,
					console : true,
					module : true
				}
			}
		},
		watch : {
			files : ['<%= jshint.files %>'],
			tasks : ['jshint']
		},
		simplemocha : {
			options : {
				globals : ['should'],
				timeout : 15000,
				ignoreLeaks : false,
				ui : 'bdd',
				reporter : 'list'
			},
			all : {
				src : './spec/apiwrapper-spec-mocha.js'
			}
		},
		jasmine_node : {
			options : {
				forceExit : true,
				match : '.',
				matchall : false,
				extensions : 'js',
				specNameMatcher : 'spec'
			},
			all : ['./spec/']
		},
		debug : {
			options : {
				open : false // do not open node-inspector in Chrome automatically
			}
		},
		jsdoc : {
			basic : {
				options : {
					destination : './doc/basic',
					configure : 'jsdoc-conf.json'
				}
			},
			docstrap : {
				src : ['js/**.js'],
				options : {
					destination : './doc/docstrap',
					template : "node_modules/grunt-jsdoc/node_modules/ink-docstrap/template",
					configure : "node_modules/grunt-jsdoc/node_modules/ink-docstrap/template/jsdoc.conf.json"
				}
			}
		}
	});

    grunt.loadTasks('tasks');

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-simple-mocha');
	grunt.loadNpmTasks('grunt-jasmine-node');
	grunt.loadNpmTasks('grunt-debug-task');
	grunt.loadNpmTasks('grunt-jsdoc');
	
	
	grunt.registerTask('debugger', ['debug']);
	grunt.registerTask('jasmine', 'jasmine_node');
	grunt.registerTask('hint', ['jshint']);
	grunt.registerTask('build-min', ['concat', 'uglify']);
	grunt.registerTask('default', ['jshint', 'concat', 'uglify']);
	grunt.registerTask('build', ['concat']);
	grunt.registerTask('mocha', 'simplemocha');
	grunt.registerTask('doc', 'jsdoc:basic');
	grunt.registerTask('docstrap', 'jsdoc:docstrap');
};
