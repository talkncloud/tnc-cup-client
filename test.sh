#!/bin/sh
# tnc-cup test script.
#
# This loops through the test files and runs each one.
# This is just basic testing of the client and backend.
# You will need your client configured first e.g. key.

# Build
`tsc`

# Loop testfiles dir
for filename in testfiles/*; do
    node dist/cli.js -t $filename
done