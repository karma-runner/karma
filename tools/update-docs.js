const { execSync } = require('child_process')
const { dirSync } = require('tmp')

const success = async (pluginConfig, { nextRelease, logger }) => {
  const [major, minor] = nextRelease.version.split('.')
  const docsVersion = `${major}.${minor}`

  const { name: docsPath } = dirSync()

  // This is a regular repository remote one would get if they click a Clone
  // button on GitHub. The only added part is DOCS_GITHUB_TOKEN value in the
  // `userinfo` part of the URL (https://en.wikipedia.org/wiki/URL), which
  // allows GitHub to authenticate a user and authorise the push to the
  // repository.
  const repoOrigin = `https://${process.env.DOCS_GITHUB_TOKEN}@github.com/karma-runner/karma-runner.github.com.git`

  const options = { encoding: 'utf8', cwd: docsPath }

  logger.log(execSync(`git clone ${repoOrigin} .`, options))
  logger.log(execSync('npm ci', options))
  logger.log(execSync(`./sync-docs.sh "${nextRelease.gitTag}" "${docsVersion}"`, options))
  logger.log(execSync('git push origin master', options))
}

module.exports = { success }
