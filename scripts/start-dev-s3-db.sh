#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

readonly repository="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd)"
readonly ENV="dev"
source "$repository/scripts/common.sh"

function main() {
    pushd "$repository"

    echo "::group::Starting development DB & S3 in $COMPOSE_PROJECT_NAME"
    compose_cmd up -d
    compose_cmd logs -f db s3
    echo "::endgroup::"

    popd
}

main "$@"