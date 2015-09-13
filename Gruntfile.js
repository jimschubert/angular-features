'use strict';

module.exports = function(grunt) {

    var pkg = grunt.file.readJSON('package.json');
    grunt.initConfig({
        pkg: pkg,
        clean: ['dist/','<%= pkg.name %>.js'],
        jshint: {
            options: {
                reporter: require('jshint-stylish'),
                jshintrc: true
            },
            all: ['src/**/*.js']
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> v<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %>, <%= pkg.author %> (c) <%= grunt.template.today("yyyy") %> MIT License */\n',
                // mangle: false,
                sourceMap: true,
                enclose: true
            },
            build: {
                files: [{
                    cwd: 'src',
                    src: '**/*.js',
                    dest: 'dist/',
                    expand: true,
                    flatten: false,
                    ext: '.js',
                    rename: function (dest, src) {
                        var folder = src.substring(0, src.lastIndexOf('/'));
                        var filename = src.substring(src.lastIndexOf('/'), src.length);

                        return dest + folder + pkg.name + '.'+ filename;
                    }
                }],

                options: {
                    beautify: true,
                    compress: false,
                    enclose: true,
                    mangle: false,
                    preserveComments: 'all'
                }
            },
            'build-minify': {
                files: [{
                    cwd: 'src',
                    src: '**/*.js',
                    dest: 'dist/',
                    expand: true,
                    flatten: true,
                    ext: '.min.js',
                    compress: true,
                    rename: function (dest, src) {
                        var folder = src.substring(0, src.lastIndexOf('/'));
                        var filename = src.substring(src.lastIndexOf('/'), src.length);

                        return dest + folder + pkg.name + '.'+ filename;
                    }
                }]
            },
            dist: {
                files: [{
                    src: ['<%= concat.dist.dest %>'],
                    dest: 'dist/all',
                    expand: true,
                    flatten: false,
                    ext: '.js'
                }],

                options: {
                    beautify: true,
                    compress: false,
                    enclose: true,
                    mangle: false,
                    preserveComments: 'all'
                }
            },
            'dist-minify': {
                files: [{
                    src: ['<%= concat.dist.dest %>'],
                    dest: 'dist/all',
                    expand: true,
                    flatten: true,
                    ext: '.min.js',
                    compress: true
                }]
            }
        },

        concat: {
            options: {
                separator: ';',

                // Replace all 'use strict' statements in the code with a single one at the top
                banner: "'use strict';\n",
                process: function(src, filepath) {
                    return '// Source: ' + filepath + '\n' +
                        src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1');
                }
            },

            dist: {
                // the files to concatenate
                src: ['src/**.js'],
                dest: '<%= pkg.name %>.js'
            }
        },

        shell : {
            cleanup: {
                command: 'rm <%= pkg.name %>.js'
            }
        },
        
        bump: {
            options: {
                files: ['package.json', 'bower.json'],
                updateConfigs: [],
                commit: true,
                commitMessage: 'Release v%VERSION%',
                commitFiles: ['package.json', 'bower.json'],
                createTag: true,
                tagName: 'v%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: true,
                pushTo: 'upstream',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
                globalReplace: false,
                prereleaseName: false,
                regExp: false
            }
        },
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-bump');

    // Default task(s).
    grunt.registerTask('b', ['bump-only:minor']);
    grunt.registerTask('default', ['clean','jshint', 'concat','uglify','shell:cleanup']);
};