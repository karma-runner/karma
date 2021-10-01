PKG_FILE="$PWD/$(npm pack)"
# TODO: Revert once https://github.com/karma-runner/integration-tests/pull/15 is merged
git clone https://github.com/devoto13/integration-tests.git --depth 1 -b headless
cd integration-tests
./run.sh $PKG_FILE
