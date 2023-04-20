const { execSync } = require('child_process')
const { readFileSync, writeFileSync } = require('fs')
const { resolve } = require('path')

const prepare = async (pluginConfig, { logger }) => {
  // Example output:
  //   1042  Vojta Jina <vojta.jina@gmail.com>
  //    412  Friedel Ziegelmayer <friedel.ziegelmayer@gmail.com>
  //    206  dignifiedquire <friedel.ziegelmayer@gmail.com>
  //    139  johnjbarton <johnjbarton@johnjbarton.com>
  const stdout = execSync('git log --pretty=short | git shortlog -nse', { encoding: 'utf8' })

  const pkgPath = resolve(__dirname, '..', 'package.json')
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))

  // First line is already included as author field. Last line is dropped as it is an empty line.
  pkg.contributors = stdout.split('\n').slice(1, -1).map((line) => line.replace(/^[\W\d]+/, ''))
  writeFileSync(pkgPath, JSON.stringify(pkg, undefined, '  ') + '\n', 'utf8')

  logger.info('Updated contributors list.')
}

module.exports = { prepare }
