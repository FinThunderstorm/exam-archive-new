#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

readonly repository="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd)"
readonly ENV="security"
source "$repository/scripts/common.sh"

function stop() {
  pushd "$repository"
  compose_cmd down -v || true
  popd
}
trap stop EXIT

function main() {
    required_command npm

    pushd "$repository"

    npm_ci

    start_db_s3

    build_docker_image

    echo "::group::Run database migrations and seeds"
    npm run db:migrate
    NODE_ENV=development npm run db:seed
    echo "::endgroup::"

    echo "::group::Starting application"
    compose_cmd up -d tarpisto
    echo "::endgroup::"

    echo "::group::Running security scan"
    mkdir -p test-results

    if [[ -f "${GITHUB_ACTIONS:-}" ]]; then
      echo "::debug::Running in GitHub Actions, so doing some file permission magic" # Maybe in future: check if Linux instead of GHA
      mkdir -p test-results
      chown -R zap:zap test-results
      chmod -R 777 test-results
    fi

    echo "Tests started at $(date)"
    compose_cmd up --exit-code-from security security
    # compose_cmd cp security:/tmp/zap/reports/security-report.md $repository/test-results/security-report.md
    echo "::endgroup::"

    if [[ -f "${GITHUB_ACTIONS:-}" ]]; then
      echo "::group::Report results"
      echo "$(cat $repository/test-results/security-report.md)" >> $GITHUB_STEP_SUMMARY
      echo "::endgroup::"
    fi

    popd
}

main "$@"