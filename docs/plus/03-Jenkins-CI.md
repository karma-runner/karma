[Jenkins CI] is one of the most popular continuous integration servers
in the market today. At some point while developing your [AngularJS]
project (hopefully early on), you might want to have automated tests run
off your code versioning system. Jenkins will help you with this task.
You can integrate Testacular to your Jenkins setup fairly easy and as of
version 0.3.12, test results can be "pretty printed" into a format
Jenkins understands (i.e. no need to hunt down failures in the console
log). This tutorial assumes you have Jenkins already setup and running
on your CI environment.

## Install Prerequisites
You need the following tools installed on your Jenkins CI server:

* Node
* Testacular

Optional we highly suggest to install the following Jenkins plug-in:
[EnvInject] as it makes things easier under certain linux
distributions and user permissions.

## Configure Testacular
 Make the following additions and changes to your testacular config
 file as needed:

```javascript
singleRun = true;
reporters = ['dots', 'junit'];
junitReporter = {
  outputFile: 'test-results.xml'
};
 ```

Please note the `test-result.xml` file will be output to the present
working directory (and you will need to tell Jenkins where to find it).

## Create a new Jenkins Job
In Jenkins, start a new job for Angular/Testacular with the basic
settings (Name, description, parameters, source code repo to pull
from, etc.)

## Configure the Build Environment
First go to the job page and click on configure. Then in the Build
Environment sub-section, check the “Inject environment
variables to the build process” checkbox. A few textboxes will
appear and in the “Properties Content” box set the following:

```bash
$ PATH=/sbin:/usr/sbin:/bin:/usr/bin:/usr/local/bin
$ PHANTOMJS_BIN=/usr/local/bin/phantomjs #or wherever PhantomJS happens to be installed
```

Further down the page, in the Post-build Actions sub-section add a
`Publish JUnit test result report` from the Post-build action drop
down menu. When the textbox labeled Test report XMLs appears, enter
the path to where the `test-results.xml` is relative to the root of
your Jenkins job workspace.



[Jenkins CI]: http://jenkins-ci.org/
[AngularJS]: http://angularjs.org
[EnvInject]: https://wiki.jenkins-ci.org/display/JENKINS/EnvInject+Plugin
