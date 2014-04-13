#!/bin/bash

# Take a PR from Github, merge it into master/stable and push that into presubmit-master/stable
# so that presubmit will merge it into master/stable if all the tests pass.


PR_NUMBER=$1
ORIGINAL_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Stash local changes first.
if [ "$(git status -s --untracked-files=no)" ]; then
  git stash
  STASHED=true
fi

if [ $PR_NUMBER ]; then
  PR_BRANCH_CREATED=true
  PR_BRANCH="pr-$PR_NUMBER"
  git fetch upstream pull/$PR_NUMBER/head:$PR_BRANCH
  git checkout $PR_BRANCH
else
  echo "No PR number provided, merging the current branch."
  PR_BRANCH=$ORIGINAL_BRANCH
fi

# Make sure we have all the latest bits.
git fetch upstream master
git fetch upstream stable

# Determine whether merging to master/stable.
COMMON_PARENT=$(git merge-base $PR_BRANCH master)
if git merge-base --is-ancestor $COMMON_PARENT stable; then
  MERGE_INTO="stable"
else
  MERGE_INTO="master"
fi

# Do not merge feat changes into stable.
if [ "$MERGE_INTO" = "stable" ]; then
  DIFF_FEAT=$(git log $PR_BRANCH ^$MERGE_INTO --grep "^feat" --oneline)
  if [ "$DIFF_FEAT" ]; then
    echo "Can not merge features into stable. Merging into master instead."
    MERGE_INTO="master"
  fi
fi

echo "Merging into $MERGE_INTO..."
git log $PR_BRANCH ^$MERGE_INTO --no-merges --oneline

MERGING_BRANCH="presubmit-$MERGE_INTO-$PR_BRANCH"
git checkout -b $MERGING_BRANCH upstream/$MERGE_INTO
git merge $PR_BRANCH
git push upstream $MERGING_BRANCH

# Revert the original state of the workspace.
git checkout $ORIGINAL_BRANCH
if [ "$STASHED" ]; then
  git stash pop
fi

git branch -D $MERGING_BRANCH
if [ "$PR_BRANCH_CREATED" ]; then
  git branch -D $PR_BRANCH
fi
