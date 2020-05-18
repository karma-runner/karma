module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    pkgFile: 'package.json',
    files: {
      server: ['lib/**/*.js'],
      client: ['client/**/*.js'],
      common: ['common/**/*.js'],
      context: ['context/**/*.js'],
      grunt: ['grunt.js', 'tasks/*.js'],
      scripts: ['scripts/init-dev-env.js']
    },
    browserify: {
      client: {
        files: {
          'static/karma.js': ['client/main.js'],
          'static/context.js': ['context/main.js']
        }
      }
    },
    test: {
      unit: 'mochaTest:unit',
      client: 'test/client/karma.conf.js'
    },
    watch: {
      client: {
        files: '<%= files.client %>',
        tasks: 'browserify:client'
      }
    },
    mochaTest: {
      options: {
        reporter: 'dot',
        ui: 'bdd',
        quiet: false,
        colors: true
      },
      unit: {
        src: [
          'test/unit/mocha-globals.js',
          'test/unit/**/*.spec.js'
        ]
      }
    },
    'npm-publish': {
      options: {
        requires: ['build'],
        abortIfDirty: true,
        tag: 'latest'
      }
    },
    'npm-contributors': {
      options: {
        commitMessage: 'chore: update contributors'
      }
    },
    conventionalChangelog: {
      release: {
        options: {
          changelogOpts: {
            preset: 'angular'
          }
        },
        src: 'CHANGELOG.md'
      }
    },
    conventionalGithubReleaser: {
      release: {
        options: {
          auth: {
            type: 'oauth',
            token: process.env.GH_TOKEN
          },
          changelogOpts: {
            preset: 'angular'
          }
        }
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
        prereleaseName: 'rc'
      }
    }
  })

  grunt.loadNpmTasks('grunt-check-clean')
  grunt.loadTasks('tasks')
  require('load-grunt-tasks')(grunt)

  grunt.registerTask('build', ['browserify:client'])
  grunt.registerTask('default', ['build', 'test'])
  grunt.registerTask('test-appveyor', ['test:unit', 'test:client'])

  grunt.registerTask('release', 'Build, bump and publish to NPM.', function (type) {
    grunt.task.run([
      'check_clean',
      'npm-contributors',
      'bump:' + (type || 'patch') + ':bump-only',
      'build',
      'conventionalChangelog',
      'bump-commit',
      'conventionalGithubReleaser',
      'npm-publish'
    ])
  })
}
