module.exports = {
  // Add logging for releases until we are fully confident of the release solution.
  debug: true,
  branches: 'master',
  verifyConditions: [
    '@semantic-release/changelog',
    '@semantic-release/npm',
    '@semantic-release/github'
  ],
  prepare: [
    './tools/update-contributors',
    '@semantic-release/changelog',
    '@semantic-release/npm',
    '@semantic-release/git'
  ],
  publish: [
    '@semantic-release/npm',
    '@semantic-release/github'
  ],
  success: [
    '@semantic-release/github',
    './tools/update-docs'
  ],

  // The release rules determine what kind of release should be triggered
  // based on the information included in the commit message. The default
  // rules used by semantic-release are the same, but they are set explicitly
  // for better visibility.
  // See https://github.com/semantic-release/commit-analyzer/blob/master/lib/default-release-rules.js
  releaseRules: [
    { breaking: true, release: 'major' },
    { revert: true, release: 'patch' },
    { type: 'feat', release: 'minor' },
    { type: 'fix', release: 'patch' },
    { type: 'perf', release: 'patch' }
  ],

  // The preset determines which commits are included in the changelog and how
  // the changelog is formatted. The default value used by semantic-release is
  // the same, but it is set explicitly for visibility.
  // See https://semantic-release.gitbook.io/semantic-release/#commit-message-format
  // See https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular
  preset: 'angular'
}
