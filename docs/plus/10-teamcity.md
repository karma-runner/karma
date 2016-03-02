pageTitle: TeamCity
menuTitle: TeamCity

Running Karma in your [TeamCity] build is as simple as adding command line build
step to perform the task. That is basically it.

## Install Prerequisites
The only prerequisite is `Node` (with `npm`) installed on the agent(s) you are going to use to
run build on.
You may decide to install Karma and Karma-related packages on the agent globally to reuse the same
Karma installation by different builds.

## Configure project
Add `karma-teamcity-reporter` as a dependency to your project:

    npm i --save-dev karma-teamcity-reporter

It is also a good idea to check that you have all karma npm dependencies listed in your
`package.json` file (e.g. `karma-jasmine`, `karma-phantomjs-launcher` and so on) to have them
being installed during the build.

## Create a new TeamCity build step
Add new build step to the build configuration: use Command Line runner and fill in `Custom
script` text area. If you had decided not to install *all* your NPM dependencies globally
add `npm install` at the beginning of the script. Then add command to run Karma, e.g.:

    karma start --reporters teamcity --single-run --browsers PhantomJS --colors false

Running Karma with all these options provided via command line allows to run Karma in
TeamCity build and locally in development environment (with options from configuration
file).

[TeamCity]: https://www.jetbrains.com/teamcity/
