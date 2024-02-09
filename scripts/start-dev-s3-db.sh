#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

readonly repository="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd)"
readonly ENV="dev"
source "$repository/scripts/common.sh"

function main() {
    pushd "$repository"

    compose_cmd up

    popd
}

main "$@"