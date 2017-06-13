pageTitle: Angular (TypeScript)
menuTitle: Angular (TypeScript)

Running Karma with Angular requires the cooperation of a variety of tools in order to have a 
fulfilling experience.

## Install Prerequisites
Angular uses TypeScript, therefore some additional configuration is recommended.
 Using the following [angular-cli] command refers to a configuration parameter in angular.cli-json.
```sh
ng test
```
angular-cli.json
```json
{
    "test": {
        "karma": {
            "config": "./karma.conf.js"
        }
    }
}
```
package.json
```json
{
    ...
    "devDependencies": {
        "istanbul-instrumenter-loader": "latest",
        "karma" : "latest",
        "karma-coverage": "latest",
        "karma-sourcemap-loader": "latest",
        "karma-webpack": "latest",
    }
}
```

## Configuration

* Karma [Webpack] - TypeScript must be transpiled so use with webpack is essential.
* Karma [SourceMap] Loader - SourceMaps to refer back to the original TypeScript code.
* Karma [Coverage] - See below for additional Webpack details.

```files: ['src/**/*.ts']``` should be listed for Webpack and reporting on, but not included in the test.

karma.conf.js
```js
config.set({

    files: [
        {pattern: 'src/**/*.ts', included: false, watched: false, served: false},
        {pattern: './karma-test-shim.js', watched: false},
    ],

    preprocessors: {
        './karma-test-shim.js': ['webpack', 'sourcemap'],
    },
    
    webpack: webpackConfig,
    
    webpackMiddleware: {
        stats: 'errors-only'
    },
    
    // omit entirely or add to the list
    plugins: [/* ... */, 'karma-coverage', 'karma-webpack', 'karma-sourcemap-loader']
    
});
```

## Coverage

Coverage requires input from Webpack because it is transpiled with [Instrumenter] loader.

The ```exclude: ``` line excludes .spec or test files from the coverage report.

webpack.test.js
```js
module.exports = {
    devtool: 'inline-source-map',
    
    loaders: [
        {
            test: /\.ts/,
            include: helpers.root('src', 'app'), // or path.resolve('./src/app')
            loader: 'istanbul-instrumenter-loader',
            enforce: 'post',
            exclude: /(tests|node_modules|\.spec\.ts$)/
        }
    ]
}
```
This is just a sample coverage configuration:

karma.conf.js
```js
config.set({

    files: [
        ...
    ],
    
    webpack: ...,

    coverageReporter: {
        dir: './coverage/',
        includeAllSources: true,
        reporters: [
//                {type: 'lcov'},  // currently broken https://github.com/karma-runner/karma-coverage/issues/157
            {type: 'text-summary'},
            {type: 'text'}
        ]
    },
    
    reporters: ['spec', 'coverage'],
    
    plugins: ['progress', 'karma-coverage'],  
})
```


## Expected Output

So you too can share in the satisfaction of having reportable test coverage using TypeScript and Angular24+?:

```
=============================== Coverage summary ===============================
Statements   : 79.21% ( 241/304 )
Branches     : 47.91% ( 101/210 )
Functions    : 77.9% ( 51/65 )
Lines        : 81.32% ( 225/277 )
================================================================================
------------------------------------|----------|----------|----------|----------|----------------|
File                                |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
------------------------------------|----------|----------|----------|----------|----------------|
 app/                               |    67.69 |    31.11 |    53.33 |    68.33 |                |
  app.component.ts                  |    67.69 |    31.11 |    53.33 |    68.33 |... ,99,101,108 |
 app/list/                          |    69.88 |    47.22 |     52.5 |     70.5 |                |
  list.component.ts                 |    82.14 |    46.15 |       75 |    84.31 |... 59,72,73,75 |
  list.service.ts                   |    73.53 |    57.78 |    47.37 |     74.6 |... 88,89,90,92 |
 app/auth/                          |     84.4 |     48.6 |     93.1 |     87.3 |                |
  auth.manager.ts                   |    70.91 |     35.9 |    84.62 |       72 |... 44,45,46,49 |
  auth.service.ts                   |    94.74 |    59.46 |      100 |    98.08 |              5 |
 app/detail/                        |    89.39 |    54.47 |    85.88 |    92.83 |                |
  detail.component.ts               |    84.44 |    54.55 |       70 |     87.5 |  5,44,45,51,54 |

```


[Instrumenter]: https://github.com/webpack-contrib/istanbul-instrumenter-loader
[Coverage]: https://github.com/karma-runner/karma-coverage
[angular-cli]: https://github.com/angular/angular-cli
[SourceMap]: https://github.com/demerzel3/karma-sourcemap-loader
[Webpack]: https://github.com/webpack-contrib/karma-webpack