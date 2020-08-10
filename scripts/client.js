const browserify = require('browserify')
const fs = require('fs')
const { readFile } = require('fs').promises

const bundleResourceToFile = (inPath, outPath) => {
  return new Promise((resolve, reject) => {
    browserify(inPath).bundle()
      .pipe(fs.createWriteStream(outPath))
      .once('finish', () => resolve())
      .once('error', (e) => reject(e))
  })
}

const bundleResource = (inPath) => {
  return new Promise((resolve, reject) => {
    browserify(inPath).bundle((err, buffer) => {
      if (err != null) {
        reject(err)
        return
      }

      resolve(buffer)
    })
  })
}

const main = async () => {
  if (process.argv[2] === 'build') {
    await bundleResourceToFile('client/main.js', 'static/karma.js')
    await bundleResourceToFile('context/main.js', 'static/context.js')
  } else if (process.argv[2] === 'check') {
    const expectedClient = await bundleResource('client/main.js')
    const expectedContext = await bundleResource('context/main.js')

    const actualClient = await readFile('static/karma.js')
    const actualContext = await readFile('static/context.js')

    if (Buffer.compare(expectedClient, actualClient) !== 0 || Buffer.compare(expectedContext, actualContext) !== 0) {
      // eslint-disable-next-line no-throw-literal
      throw 'Bundled client assets are outdated. Forgot to run "npm run build"?'
    }
  } else {
    // eslint-disable-next-line no-throw-literal
    throw `Unknown command: ${process.argv[2]}`
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
