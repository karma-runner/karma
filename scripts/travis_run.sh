#!/bin/bash

set -e

grunt build
grunt test
grunt lint
./scripts/integration-tests.sh
