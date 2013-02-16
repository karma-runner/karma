# Configuration
In order to serve you well, Testacular needs to know about your project. That's done through a configuration file.

For an example configuration, see [test/client/testacular.conf.js]
which contains most of the options.


## Generating the config file
You can write the config file by hand or copy paste from some other project.

Another way is to use `testacular init` to generate it.

```bash
# will ask you a few questions and generate the config file for you
$ testacular init my.conf.js
```


## Starting Testacular
When starting testacular, you can pass a path to the configuration file as an argument.

By default, Testacular will look for `testacular.conf.js` in the current directory.

```bash
# start testacular using your configuration
$ testacular start my.conf.js
```

For more info about configuration file, see the [configuration file docs].


## Command line arguments

Some of the configuration can be specified as a CLI argument, which overrides the configuration from the config file.

Try `testacular start --help` to see all the available options.


[test/client/testacular.conf.js]: https://github.com/testacular/testacular/blob/master/test/client/testacular.conf.js

[configuration file docs]: configuration_file.html
