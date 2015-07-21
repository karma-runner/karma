module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    pkgFile: 'package.json',
    files: {
      server: ['lib/**/*.js'],
      client: ['client/**/*.js'],
      grunt: ['grunt.js', 'tasks/*.js'],
      scripts: ['scripts/init-dev-env.js']
    },
    browserify: {
      client: {
        files: {
          'static/karma.js': ['client/main.js']
        }
      }
    },
    test: {
      unit: 'mochaTest:unit',
      client: 'test/client/karma.conf.js',
      e2e: 'cucumberjs:ci'
    },
    watch: {
      client: {
        files: '<%= files.client %>',
        tasks: 'browserify:client'
      }
    },
    mochaTest: {
      options: {
        ui: 'bdd',
        reporter: 'dot',
        quite: false,
        colors: true
      },
      unit: {
        src: [
          'test/unit/mocha-globals.coffee',
          'test/unit/**/*.coffee'
        ]
      }
    },
    cucumberjs: {
      options: {
        steps: 'test/e2e/steps',
        format: 'progress'
      },
      all: 'test/e2e/*.feature',
      current: {
        files: {
          src: 'test/e2e/*.feature'
        },
        options: {
          tags: '@current'
        }
      },
      ci: {
        files: {
          src: 'test/e2e/*.feature'
        },
        options: {
          tags: '~@not-jenkins'
        }
      }
    },
    eslint: {
      target: [
        '<%= files.server %>',
        '<%= files.grunt %>',
        '<%= files.scripts %>',
        '<%= files.client %>',
        'test/**/*.js'
      ]
    },
    coffeelint: {
      unittests: {
        files: {
          src: ['test/unit/**/*.coffee']
        }
      },
      taskstests: {
        files: {
          src: ['test/tasks/**/*.coffee']
        }
      },
      options: {
        max_line_length: {
          value: 100
        }
      }
    },
    'npm-publish': {
      options: {
        requires: ['build'],
        abortIfDirty: true,
        tag: function () {
          var version = grunt.config('pkg.version')
          if (version.match(/rc/)) {
            return 'canary'
          } else {
            return 'latest'
          }
        }
      }
    },
    'npm-contributors': {
      options: {
        commitMessage: 'chore: update contributors'
      }
    },
    bump: {
      options: {
        updateConfigs: ['pkg'],
        commitFiles: [
          'package.json',
          'CHANGELOG.md'
        ],
        commitMessage: 'chore: release v%VERSION%',
        push: false,
        prereleaseName: 'rc'
      }
    }
  })

  grunt.loadTasks('tasks')
  require('load-grunt-tasks')(grunt)

  grunt.registerTask('build', ['browserify:client'])
  grunt.registerTask('default', ['build', 'test', 'lint'])
  grunt.registerTask('lint', ['eslint', 'coffeelint'])

  grunt.registerTask('release', 'Build, bump and publish to NPM.', function (type) {
    grunt.task.run([
      'npm-contributors',
      'bump:' + (type || 'patch') + ':bump-only',
      'build',
      'changelog',
      'bump-commit',
      'npm-publish'
    ])
  })
}
