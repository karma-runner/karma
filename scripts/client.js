const browserify = require('browserify')
const watchify = require('watchify')
const { createWriteStream } = require('fs')
const { readFile } = require('fs').promises

const bundleResourceToFile = (inPath, outPath) => {
  return new Promise((resolve, reject) => {
    browserify(inPath).bundle()
      .once('error', (e) => reject(e))
      .pipe(createWriteStream(outPath))
      .once('finish', () => resolve())
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

const watchResourceToFile = (inPath, outPath) => {
  const b = browserify({
    entries: [inPath],
    cache: {},
    packageCache: {},
    plugin: [watchify]
  })

  const bundle = () => {
    b.bundle()
      .once('error', (e) => {
        console.error(`Failed to bundle ${inPath} into ${outPath}.`)
        console.error(e)
      })
      .pipe(createWriteStream(outPath))
      .once('finish', () => console.log(`Bundled ${inPath} into ${outPath}.`))
  }

  b.on('update', bundle)
  bundle()
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
  } else if (process.argv[2] === 'watch') {
    watchResourceToFile('client/main.js', 'static/karma.js')
    watchResourceToFile('context/main.js', 'static/context.js')
  } else {
    // eslint-disable-next-line no-throw-literal
    throw `Unknown command: ${process.argv[2]}`
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
