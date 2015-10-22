pageTitle: Jenkins CI
menuTitle: Jenkins CI

[Jenkins CI] is one of the most popular continuous integration servers
in the market today. At some point while developing your [AngularJS]
project (hopefully early on), you might want to have automated tests run
off your code versioning system. Jenkins will help you with this task.
This tutorial assumes you have Jenkins already setup and running
on your CI environment.

## Install Prerequisites
You need the following tools installed on your Jenkins CI server:

* Node
* Karma

The following Jenkins plugin is optional, but the next guidelines are based on it:
* [EnvInject] - it makes things easier under certain linux distributions and user permissions.

## Configure Karma
 Make the following additions and changes to your `karma.conf.js`
 file as needed:

```javascript
singleRun: true,
reporters: ['dots', 'junit'],
junitReporter: {
  outputFile: 'test-results.xml'
},
 ```

Please note the `test-results.xml` files will be written to subdirectories
named after the browsers the tests were run in inside the present working
directory (and you will need to tell Jenkins where to find them).

## Create a new Jenkins Job
In Jenkins, start a new job for Angular/Karma with the basic
settings (Name, description, parameters, source code repo to pull
from, etc.)

## Configure the Build Environment
First go to the job page and click on configure. Then in the Build
Environment sub-section, check the “Inject environment
variables to the build process' checkbox. A few textboxes will
appear and in the “Properties Content” box set the following:

```bash
$ PATH=/sbin:/usr/sbin:/bin:/usr/bin:/usr/local/bin
$ PHANTOMJS_BIN=/usr/local/bin/phantomjs #or wherever PhantomJS happens to be installed
```

Further down the page, in the Post-build Actions sub-section add a
`Publish JUnit test result report` from the Post-build action drop
down menu. When the textbox labeled Test report XMLs appears, enter
the path to where the `test-results.xml` files are relative to the root of your
Jenkins job workspace (you can use wildcards for this, so `**/test-results.xml`
will find the file even if it was stored inside a browser-specific
subdirectory).



[Jenkins CI]: http://jenkins-ci.org/
[AngularJS]: http://angularjs.org
[EnvInject]: https://wiki.jenkins-ci.org/display/JENKINS/EnvInject+Plugin
