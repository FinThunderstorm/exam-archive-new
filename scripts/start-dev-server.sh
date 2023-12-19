#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

readonly repository="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd)"
source "$repository/scripts/common.sh"

function main() {
    required_command npm
    pushd "$repository"

    db_health_check
    s3_health_check

    export PORT=${PORT:-"9000"}
    export PG_CONNECTION_STRING=${PG_CONNECTION_STRING:-"postgresql://tarpisto:tarpisto@$(docker-compose port db 5432)/tarpisto"}

    export USER_SERVICE_SERVICE_ID=${USER_SERVICE_SERVICE_ID:-"11188b9c-9534-4faf-8355-60973b720647"}
    export USER_SERVICE_URL=${USER_SERVICE_URL:-"http://127.0.0.1:8080"}
    export USER_SERVICE_SECRET=${USER_SERVICE_SECRET:-"catlike-meringue-tying-PASTERN-bed-simply"}

    export NEXTAUTH_URL=${NEXTAUTH_URL:-"http://127.0.0.1:9000"}
    export NEXTAUTH_SECRET=${NEXTAUTH_SECRET:-"catlike-meringue-tying-PASTERN-bed-simply"}

    export AWS_REGION=${AWS_REGION:-"eu-west-1"}
    export AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID:-"tarpisto"}
    export AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY:-"tarpisto"}

    export AWS_S3_ENDPOINT=${AWS_S3_ENDPOINT:-"http://$(docker-compose port s3 9001)"}
    export AWS_S3_FORCE_PATH_STYLE=${AWS_S3_FORCE_PATH_STYLE:-true}
    export AWS_S3_BUCKET_ID=${AWS_S3_BUCKET_ID:-"tarpisto-local"}

    export NODE_ENV=${NODE_ENV:-"development"}
    export APP_ENV=${APP_ENV:-"development"}


    npm run db:migrate
    npm run dev

    popd
}

main "$@"