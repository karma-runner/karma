#!/bin/bash

# On presubmit branches (eg. presubmit-master-xxx or presubmit-stable-xxx),
# this script merges the changes into the main branch (master/stable).
#
# If there are any fix/feat changes, it also pushes a new release to NPM.
#
# If the main branch (master/stable) can't be fast-forwarded, a merge is done and the presubmit
# branch is pushed to upstream to get tested again.
#
# If the merge fails, the presubmit branch has to be merged manually and pushed again.
#
# This script only runs:
# - on the main repo (no forks),
# - on the leader VM (if the build contains multiple VMs),
# - on presubmit branches.


if [ "$TRAVIS_SECURE_ENV_VARS" = "false" ]; then
  echo "Ignoring. Presubmit does not run on forks."
  exit 0
fi

STABLE_BRANCH="master"
CANARY_BRANCH="canary"

case "$TRAVIS_BRANCH" in

  presubmit-canary-*)
    REMOTE_BRANCH=$CANARY_BRANCH
    ;;

  presubmit-master-*)
    REMOTE_BRANCH=$STABLE_BRANCH
    ;;

  *)
    echo "Ignoring. This is not a presubmit branch."
    exit 0
esac

# Run this only on the first Travis VM, after all others are finished and successful.
python ./scripts/travis_after_all.py
export $(cat .to_export_back)

if [ "$BUILD_LEADER" = "YES" ]; then
  if [ "$BUILD_AGGREGATE_STATUS" = "others_succeeded" ]; then
    echo "All other VMs passed."
  else
    echo "Some of the other VMs failed."
    exit 1
  fi
else
  echo "Ignoring. This VM is not the leader."
  exit 0
fi


REMOTE="https://github.com/karma-runner/karma.git"
MERGING_BRANCH="merging-$TRAVIS_BRANCH"


# Authenticate Github.
git config user.name "Karma Bot"
git config user.email "karmarunnerbot@gmail.com"
git config credential.helper "store --file=.git/credentials"
echo "https://${GITHUB_TOKEN}:@github.com" > .git/credentials


# Make sure we have the latest bits.
git fetch $REMOTE $REMOTE_BRANCH
git checkout -b $MERGING_BRANCH FETCH_HEAD

# The new changes, that we are merging
DIFF_FIX=$(git log $TRAVIS_BRANCH ^$MERGING_BRANCH --grep "^fix" --oneline)
DIFF_FEAT=$(git log $TRAVIS_BRANCH ^$MERGING_BRANCH --grep "^feat" --oneline)
DIFF_DOCS=$(git log $TRAVIS_BRANCH ^$MERGING_BRANCH --grep "^docs" --oneline)

# TODO(vojta): check for --no-merges, if all commits already merged, ignore, just remove the branch.

# Fast forward local stable/master branch.
git merge --ff-only $TRAVIS_BRANCH

if [ $? -ne 0 ]; then
  # TODO(vojta): should we rebase if HEAD is already a merge commit?
  # if [ "$(git log --merges -n 1 --oneline)" = "$(git log -n 1 --oneline)" ]; then
  # # HEAD is a merge commit

  git merge --no-edit $TRAVIS_BRANCH

  if [ $? -ne 0 ]; then
    echo "Cannot merge. Please merge manually."
    exit 1
  else
    # Merged, need to test again.
    git push $REMOTE $TRAVIS_BRANCH

    if [ $? -ne 0 ]; then
      echo "Cannot push. Please merge manually."
      exit 1
    else
      echo "Re-merged into $TRAVIS_BRANCH. Another build will merge into $REMOTE_BRANCH."
      exit 0
    fi
  fi
fi

# Decide if we should push to NPM.
# If the PR contains feat/fix commits, we gonna push to NPM.
if [ "$DIFF_FEAT" ]; then
  echo "New features to be merged:"
  echo -e $DIFF_FEAT

  if [ "$REMOTE_BRANCH" = "$STABLE_BRANCH" ]; then
    echo "CAN NOT MERGE NEW FEATURES INTO STABLE BRANCH."
    exit 1
  fi

  PUSH_TO_NPM=true
fi

if [ "$DIFF_FIX" ]; then
  echo "New fixes to be merged:"
  echo -e $DIFF_FIX

  PUSH_TO_NPM=true
fi


if [ "$PUSH_TO_NPM" ]; then
  if [ "$REMOTE_BRANCH" = "$STABLE_BRANCH" ]; then
    grunt bump-only:patch changelog bump-commit
  else
    # master, mark the version with git SHA, but do not commit
    grunt bump-only:git
  fi
fi




# Push to github.
git push $REMOTE $MERGING_BRANCH:$REMOTE_BRANCH

if [ $? -ne 0 ]; then
  echo "Cannot push to github, please rebase to the latest $REMOTE_BRANCH".
  # TODO(vojta): try merge and squash the merge commits
  rm .git/credentials
  exit 1
else
  # TODO(vojta): if stable, create another presubmit for merging into master
  git push $REMOTE --tags
  echo "Successfuly merged and pushed to github. Removing the branch."
  git push $REMOTE :$TRAVIS_BRANCH
fi


# Authenticate NPM.
npm config set email "karmarunnerbot@gmail.com"
npm config set _auth $NPM_TOKEN

if [ "$PUSH_TO_NPM" ]; then
  if [ "$REMOTE_BRANCH" = "$STABLE_BRANCH" ]; then
    npm publish --tag latest
  else
    LATEST_VERSION=$(npm info karma@latest version)
    npm publish --tag canary
    npm tag karma@$LATEST_VERSION latest
  fi
else
  echo "There is nothing to be pushed to NPM."
fi

# Clean up the credentials.
npm config set _auth ""
rm .git/credentials
