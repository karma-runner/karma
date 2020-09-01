module.exports = {
  // Add logging for releases until we are fully confident of the release solution.
  debug: true,
  branch: 'master',
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
  ]
}
