#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

readonly repository="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd)"
readonly ENV="dev"
source "$repository/scripts/common.sh"

function stop() {
  pushd "$repository"
  compose_cmd down || true
  popd
}
trap stop EXIT

required_command tmux

npm_ci
docker_health_check

function main() {
    pushd "$repository"

    session="tarpisto"

    tmux kill-session -t $session || true
    tmux start-server
    tmux new-session -d -s $session

    tmux splitw -h

    tmux select-pane -t 0
    tmux send-keys "./scripts/start-dev-server.sh" C-m
    tmux select-pane -t 0 -T "next dev"

    tmux select-pane -t 1
    tmux send-keys "./scripts/start-dev-s3-db.sh" C-m
    tmux select-pane -t 1 -T "db & s3 logs"

    tmux select-pane -t 0
    tmux set pane-border-status top
    tmux attach-session -t $session
    popd
}

main "$@"

