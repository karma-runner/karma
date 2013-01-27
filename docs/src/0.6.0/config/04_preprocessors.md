# Preprocessors

Preprocessors in Testacular allow you to do some work with your files before
they get served to the browser. The configuration of these happens in this block
in the config file.

```javascript
preprocessors = {
  '**/mini.match': 'preprocessor1',
  '**/*.all': 'preprocessor2'
};
```

## Available Preprocessors
* [[CoffeeScript]]
* [[Live]] (`>=0.5`)
* [[Coverage]] (`>= 0.5`)

## Minimatching
The keys of the preprocessors config object are used to filter the files specified in
the `files` configuration. The file paths are expanded to an absolute path, based on 
the `basePath` config and the directory of the configuration file. See [[Files]] for more
information on that. 
This expanded path is then matched using [minimatch](https://github.com/isaacs/minimatch)
against the specified key.
So for example the path `/my/absolute/path/to/test/unit/file.coffee` matched against
the key `**/*.coffee` would return true, but the matched against just `*.coffee` it would
return false and the preprocessor would not be executed on the CoffeeScript files.



