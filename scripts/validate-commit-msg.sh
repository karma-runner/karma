#!/bin/bash
#
# Validate commit message matches our expected format
#
# Arguments:
#   <commit> Commit revision to validate
#
# Example:
# ./validate-commit-msg.sh abcdef0

# Exit on first error
set -e

# If we didn't receive a commit, then error out
# DEV: If want the HEAD commit, then use `git rev-parse HEAD`
COMMIT_REV="$1"
if [ -z "$COMMIT_REV" ]; then
  echo "Expected a commit revision to validate but received nothing" 1>&2
  exit 1
fi


# Resolve our file for output
# DEV: We use `.git` to avoid cluttering the working directory
GIT_DIR="$(git rev-parse --git-dir)"
TARGET_FILENAME=VALIDATE_COMMIT_MSG
TARGET_FILE="$GIT_DIR/$TARGET_FILENAME"

echo "Retrieving relevant commit message for $COMMIT_REV"
# Output our log message to a file
# DEV: We use `--no-merges` to skip merge commits introduced by GitHub
git log --no-merges --format=format:"%s" -n 1 "$COMMIT_REV" > "$TARGET_FILE"

echo "Validating contents of $TARGET_FILE"
cat "$TARGET_FILE"

# Validate our message
./node_modules/.bin/validate-commit-msg "$TARGET_FILENAME"
