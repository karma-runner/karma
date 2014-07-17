#!/bin/bash

# Shows a list of pending presubmit branches that have not been merged.
# These branches need manual attention.

# Fetch all the upstream branches.
git fetch upstream

# List all upstream/presubmit-* branches that have not been merged into upstream/master neither upstream/canary yet.
BRANCHES=$(comm -12 <(git branch -r --no-merged upstream/master) <(git branch -r --no-merged upstream/canary) | egrep "^\s*upstream/presubmit-" | sed "s#  upstream/##")

# Print Travis status of all these branches.
./scripts/print_travis_status.js "karma-runner/karma" "$BRANCHES" "$@"
