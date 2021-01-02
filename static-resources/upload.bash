#!/bin/bash
set -eu

function usage() {
    echo 'Usage: upload.bash [ENVIRONMENT_NAME]'
}

if [ -z ${1:-''} ]; then
    usage
    exit 1
fi

environmentName=${1:+"-$1"}

aws s3 sync ./scenarios s3://drinkbar-static-resources${environmentName}
