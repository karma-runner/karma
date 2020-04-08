---
name: Bug report
about: Create an actionable bug report
title: ''
labels: ''
assignees: ''

---

karma has an extensive set of tests and we have limited time to help with bugs. Here are some suggestions to get you unstuck.

** npm audit vulnerabilities **
Please open a Pull Request that will fix the issue. 

We get lots of these reports, from multiple automated services, from other projects, and from users. The vast majority are minor: please open a pull request if you want a fix. We only take direct action to fix serious issues that affect online users.

** how to diagnose issues **
Many issues can be diagnosed by running with `--logLevel=DEBUG` or the corresponding config option. The log prints the final configuration: does it have the values you expected? Please always post the DEBUG log in bug reports.

Is your issue related to another tool? Issues with Angular setups are probably better debugged by consulting with other Angular users.  Issues with coverage are probably related to your config, the compiler for coverage instrumentation, or possibly karma-coverage.

`karma` is all JavaScript code: perhaps you can debug your issue by adding logging?

Because of the complexity of test setups, we rarely work to fix bugs without steps to reproduce. The best approach is to create a github project that installs all the components and reproduces the bug.
