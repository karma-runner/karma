PKG_FILE="$PWD/$(npm pack)"
git clone https://github.com/karma-runner/integration-tests.git --depth 1
cd integration-tests
./run.sh $PKG_FILE
