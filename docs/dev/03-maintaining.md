pageTitle: Maintaining Karma



This document is for people working on Karma. It describes common tasks such as triaging or merging
pull requests.

If you are interested in contributing to Karma, you might check out [Contributing to Karma].

We use [gitter/karma-runner] to talk about pull requests and issues, stuff like,
“hey this is important, can you look into it...”, “I’m not sure what to do about this issue...”.


## Triaging issues
New issues pop up every day. We need to identify urgent issues (such as “nobody can install karma”),
close duplicates, answer questions, etc.

See [angular/TRIAGING.md] for more info.

An issue or pull request is untriaged (needs to be triaged) when it is not assigned to any milestone.

## Merging a pull request
Please, make sure:
- Travis build is green.
- At least one owner (other than you) approved the PR
  - by commenting “LGTM” or something like that.
  - if it’s just a simple docs change or a typo fix, feel free to skip this step.
- All the commits follow the [convention].
  - This is very important, because the auto-release tasks depend on it.
  - Commits are squashed. Each change is a single commit.
    - e.g. if the PR contains two changes such as, `fix(web-server): xxx` and then `style(web-server): missing semicolons`; it should be two separate changes
    - e.g. if the first commit is `fix(web-server): serve binary files` and a second commit is “fix unit tests broken in the previous commit”, you should squash them into a single commit.
  - It’s alright to ask the author of the pull request to fix any of the above.

## Ownership
Every project has one or more owners (or “maintainers”), listed in `owners` field of the
`package.json`. Typically, owners have push permissions.

Being a maintainer of one plugin doesn’t mean you can’t contribute to some other plugins.
In fact, you can be a maintainer of multiple projects. The main point is to have people who are
familiar with the codebase and therefore can better decide what a good change is or not.


## Becoming a maintainer
If you are interested in becoming a Karma maintainer, start by triaging issues, reviewing pull
requests and stop by at [gitter/karma-runner]. Once we see you are helping, we will give you push
permissions. Being a maintainer is not an obligation. You can help when you have time and be less
active when you don’t. If you get a new job and get busy, that’s alright.

These are all just recommendations, something we found to be helpful for us to be more efficient.
Nothing is set in a stone. If you feel like there is a way to improve this workflow,
please send a proposal to [karma-devs@googlegroups.com](mailto:karma-devs@googlegroups.com).

[gitter/karma-runner]: https://gitter.im/karma-runner
[convention]: http://karma-runner.github.io/latest/dev/git-commit-msg.html
[fetch_pr]: https://github.com/vojtajina/dotfiles/blob/master/bin/fetch_pr
[merge_pr]: https://github.com/vojtajina/dotfiles/blob/master/bin/merge_pr
[Contributing to Karma]: ./contributing.html
[angular/TRIAGING.md]: https://github.com/angular/angular.js/blob/master/TRIAGING.md
