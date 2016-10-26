module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt); // npm install --save-dev load-grunt-tasks

    const APP_ROOT = 'scrutineer-app/public';

    grunt.initConfig({
        copy: {
            main: {
                files: [
                    { expand: true, flatten: true, src: [APP_ROOT + '/src/css/**'], dest: APP_ROOT + '/dist/css', filter: 'isFile' },
                    // { expand: true, flatten: true, src: ['src/fonts/**'], dest: 'dist/fonts', filter: 'isFile' },
                    { expand: true, flatten: true, src: [APP_ROOT + '/src/fonts/**'], dest: APP_ROOT + '/dist/fonts', filter: 'isFile' }
                ]
            }
        },
        browserify: {
            dist: {
                files: {
                    [APP_ROOT + '/dist/scrutineer.js'] : APP_ROOT + '/src/js/scrutineer.js',
                    [APP_ROOT + '/dist/dashboard.js'] : APP_ROOT + '/src/js/dashboard.js'
                },
                options: {
                    exclude: ['node_modules/*'],
                    transform: [[
                        "babelify", {
                            sourceMap: true,
                            presets: ['es2015', 'react'],
                            plugins: [
                                'transform-inline-environment-variables'
                            ]
                        }
                    ]]
                }
            }
        },
        watch: {
            scripts: {
                files: [APP_ROOT + '/src/**/*'],
                tasks: ['browserify', 'copy'],
                options: {
                    spawn: false,
                },
            }
        },
        env : {
            dev: {
                NODE_ENV: 'DEV',
            },
            stage: {
                NODE_ENV: 'STAGE',
            },
            prod: {
                NODE_ENV: 'PROD'
            }
        }
    });

    grunt.registerTask('default', ['env:dev', 'browserify', 'copy', 'watch']);
    grunt.registerTask('build', ['env:dev', 'browserify', 'copy',]);
};